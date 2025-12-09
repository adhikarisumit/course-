"use client"

import { useEffect, useRef } from "react"

export function FlyingDragon() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Actual code snippets
    const codeLines = [
      'const x = 10;',
      'let data = [];',
      'function() {}',
      'return true;',
      'if (x > 0)',
      'for (i=0; i<10)',
      'while (true)',
      'class App {}',
      'import React',
      'export default',
      'async await',
      'try { } catch',
      'new Date()',
      '=> { }',
      'map(x => x)',
      'filter()',
      'reduce()',
      'useState()',
      'useEffect()',
      'console.log',
      'null',
      'undefined',
      'true',
      'false',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '{ }', '[ ]', '( )', '<>', '===', '!==', '&&', '||'
    ]
    const fontSize = 16
    const columns = Math.floor(canvas.width / (fontSize * 8)) // More spacing between columns
    
    // Array to track Y position and code for each column
    const drops: { y: number; code: string }[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = {
        y: Math.random() * -100,
        code: codeLines[Math.floor(Math.random() * codeLines.length)]
      }
    }

    const draw = () => {
      // Semi-transparent black background for trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Green text
      ctx.fillStyle = "#0F0"
      ctx.font = `${fontSize}px 'Courier New', monospace`

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize * 8
        const y = drops[i].y * fontSize

        ctx.fillText(drops[i].code, x, y)

        // Reset drop to top randomly and pick new code
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i].y = 0
          drops[i].code = codeLines[Math.floor(Math.random() * codeLines.length)]
        }

        drops[i].y++
      }
    }

    const interval = setInterval(draw, 100)

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10"
      style={{ background: "transparent", zIndex: 1 }}
    />
  )
}
