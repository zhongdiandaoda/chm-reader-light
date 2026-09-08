import AppKit
import Foundation

guard CommandLine.arguments.count == 3 || CommandLine.arguments.count == 5 else {
    fputs("Usage: rasterize-svg.swift <source.svg> <output.png> [width height]\n", stderr)
    exit(2)
}

let sourceURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let targetWidth: CGFloat
let targetHeight: CGFloat
if CommandLine.arguments.count == 5 {
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

guard targetWidth > 0, targetHeight > 0 else {
    fputs("Width and height must be positive numbers.\n", stderr)
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
sourceImage.draw(in: NSRect(origin: .zero, size: targetSize))
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
