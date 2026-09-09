import AppKit
import Foundation

guard CommandLine.arguments.count == 3 || CommandLine.arguments.count == 5 || CommandLine.arguments.count == 7 else {
    fputs("Usage: rasterize-svg.swift <source.svg> <output.png> [width height [inset corner-radius]]\n", stderr)
    exit(2)
}

let sourceURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let targetWidth: CGFloat
let targetHeight: CGFloat
let artworkInset: CGFloat
let cornerRadius: CGFloat
if CommandLine.arguments.count >= 5 {
    guard
        let parsedWidth = Double(CommandLine.arguments[3]),
        let parsedHeight = Double(CommandLine.arguments[4])
    else {
        fputs("Width and height must be positive numbers.\n", stderr)
        exit(2)
    }
    targetWidth = CGFloat(parsedWidth)
    targetHeight = CGFloat(parsedHeight)
} else {
    targetWidth = 1024
    targetHeight = 1024
}
if CommandLine.arguments.count == 7 {
    guard
        let parsedInset = Double(CommandLine.arguments[5]),
        let parsedCornerRadius = Double(CommandLine.arguments[6])
    else {
        fputs("Inset and corner radius must be non-negative numbers.\n", stderr)
        exit(2)
    }
    artworkInset = CGFloat(parsedInset)
    cornerRadius = CGFloat(parsedCornerRadius)
} else {
    artworkInset = 0
    cornerRadius = 0
}

guard
    targetWidth > 0,
    targetHeight > 0,
    artworkInset >= 0,
    artworkInset * 2 < targetWidth,
    artworkInset * 2 < targetHeight,
    cornerRadius >= 0
else {
    fputs("Dimensions, inset, and corner radius do not describe a valid canvas.\n", stderr)
    exit(2)
}

guard let sourceImage = NSImage(contentsOf: sourceURL) else {
    fputs("Could not read SVG source: \(sourceURL.path)\n", stderr)
    exit(1)
}

let targetSize = NSSize(width: targetWidth, height: targetHeight)
let renderedImage = NSImage(size: targetSize)
renderedImage.lockFocus()
NSGraphicsContext.current?.imageInterpolation = .high
let artworkRect = NSRect(
    x: artworkInset,
    y: artworkInset,
    width: targetWidth - artworkInset * 2,
    height: targetHeight - artworkInset * 2
)
NSGraphicsContext.current?.saveGraphicsState()
NSBezierPath(roundedRect: artworkRect, xRadius: cornerRadius, yRadius: cornerRadius).addClip()
sourceImage.draw(in: artworkRect)
NSGraphicsContext.current?.restoreGraphicsState()
renderedImage.unlockFocus()

guard
    let tiffData = renderedImage.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiffData),
    let pngData = bitmap.representation(using: .png, properties: [:])
else {
    fputs("Could not render PNG from SVG source: \(sourceURL.path)\n", stderr)
    exit(1)
}

do {
    try pngData.write(to: outputURL)
    print("Rasterized SVG: \(outputURL.path)")
} catch {
    fputs("Could not write app icon PNG: \(error.localizedDescription)\n", stderr)
    exit(1)
}
