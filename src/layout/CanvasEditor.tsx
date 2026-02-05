import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, Layer, Line, Rect, Stage, Text } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { ComponentInstance } from '../domain'

interface CanvasEditorProps {
  components: ComponentInstance[]
  selectedIds: string[]
  placingType: string | null
  focusRequest?: {
    componentId: string
    token: number
  }
  onSelect: (id: string, additive: boolean) => void
  onClearSelection: () => void
  onMoveComponent: (id: string, x: number, y: number) => void
  onPlaceComponent: (type: string, x: number, y: number) => void
}

const GRID_SIZE = 40
const SNAP_SIZE = 10
const STAGE_HALF_EXTENT = 4000
const SHAPE_SIZE = { width: 150, height: 70 }

export function CanvasEditor({
  components,
  selectedIds,
  placingType,
  focusRequest,
  onSelect,
  onClearSelection,
  onMoveComponent,
  onPlaceComponent,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [stageSize, setStageSize] = useState({ width: 900, height: 600 })
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 450, y: 300 })
  const [isPanning, setIsPanning] = useState(false)
  const [spacePressed, setSpacePressed] = useState(false)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(300, Math.round(entry.contentRect.width))
      const height = Math.max(300, Math.round(entry.contentRect.height))
      setStageSize({ width, height })
      setStagePosition((current) =>
        current.x === 450 && current.y === 300 ? { x: width / 2, y: height / 2 } : current,
      )
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!focusRequest) {
      return
    }

    const target = components.find((component) => component.id === focusRequest.componentId)
    if (!target) {
      return
    }

    const nextScale = Math.max(stageScale, 1.4)
    const targetCenterX = target.transform.x + SHAPE_SIZE.width / 2
    const targetCenterY = target.transform.y + SHAPE_SIZE.height / 2

    setStageScale(nextScale)
    setStagePosition({
      x: stageSize.width / 2 - targetCenterX * nextScale,
      y: stageSize.height / 2 - targetCenterY * nextScale,
    })
  }, [components, focusRequest, stageScale, stageSize.height, stageSize.width])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        setSpacePressed(true)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = []
    for (let x = -STAGE_HALF_EXTENT; x <= STAGE_HALF_EXTENT; x += GRID_SIZE) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, -STAGE_HALF_EXTENT, x, STAGE_HALF_EXTENT]}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={1}
          listening={false}
        />,
      )
    }

    for (let y = -STAGE_HALF_EXTENT; y <= STAGE_HALF_EXTENT; y += GRID_SIZE) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[-STAGE_HALF_EXTENT, y, STAGE_HALF_EXTENT, y]}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={1}
          listening={false}
        />,
      )
    }

    return lines
  }, [])

  const toStageCoordinates = (event: KonvaEventObject<MouseEvent | WheelEvent>) => {
    const stage = event.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) {
      return null
    }

    return {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    }
  }

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault()

    const stage = event.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!pointer) {
      return
    }

    const zoomFactor = 1.1
    const direction = event.evt.deltaY > 0 ? -1 : 1
    const nextScale = direction > 0 ? stageScale * zoomFactor : stageScale / zoomFactor
    const clampedScale = Math.min(4, Math.max(0.2, nextScale))

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    }

    setStageScale(clampedScale)
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    })
  }

  const handleStageMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    const clickedOnStage = event.target === event.target.getStage()

    if (event.evt.button === 1 || (spacePressed && event.evt.button === 0)) {
      setIsPanning(true)
      return
    }

    if (!clickedOnStage) {
      return
    }

    if (placingType) {
      const point = toStageCoordinates(event)
      if (point) {
        onPlaceComponent(
          placingType,
          Math.round(point.x / SNAP_SIZE) * SNAP_SIZE,
          Math.round(point.y / SNAP_SIZE) * SNAP_SIZE,
        )
      }
      return
    }

    onClearSelection()
  }

  return (
    <section className="canvas-editor" aria-label="Canvas editor area">
      <div ref={containerRef} className="canvas-stage-wrapper">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable={isPanning}
          onDragMove={(event) => setStagePosition({ x: event.target.x(), y: event.target.y() })}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
        >
          <Layer>{gridLines}</Layer>
          <Layer>
            {components.map((component) => {
              const isSelected = selectedIds.includes(component.id)
              const x = component.transform.x
              const y = component.transform.y
              const handlePoints = [
                { x: x - 5, y: y - 5 },
                { x: x + SHAPE_SIZE.width + 5, y: y - 5 },
                { x: x - 5, y: y + SHAPE_SIZE.height + 5 },
                { x: x + SHAPE_SIZE.width + 5, y: y + SHAPE_SIZE.height + 5 },
              ]

              return (
                <Group key={component.id}>
                  <Rect
                    x={x}
                    y={y}
                    width={SHAPE_SIZE.width}
                    height={SHAPE_SIZE.height}
                    fill="#1f6feb"
                    opacity={0.9}
                    cornerRadius={8}
                    stroke={isSelected ? '#facc15' : '#8b949e'}
                    strokeWidth={isSelected ? 3 : 1}
                    draggable
                    onClick={(event) => {
                      event.cancelBubble = true
                      onSelect(component.id, event.evt.shiftKey)
                    }}
                    onDragStart={(event) => onSelect(component.id, event.evt.shiftKey)}
                    onDragEnd={(event) => {
                      onMoveComponent(
                        component.id,
                        Math.round(event.target.x() / SNAP_SIZE) * SNAP_SIZE,
                        Math.round(event.target.y() / SNAP_SIZE) * SNAP_SIZE,
                      )
                    }}
                  />
                  <Text
                    x={x + 14}
                    y={y + 24}
                    text={component.label ?? component.type}
                    fill="#e6edf3"
                    fontSize={16}
                    listening={false}
                  />
                  {isSelected && (
                    <>
                      <Rect
                        x={x - 5}
                        y={y - 5}
                        width={SHAPE_SIZE.width + 10}
                        height={SHAPE_SIZE.height + 10}
                        stroke="#facc15"
                        strokeWidth={1}
                        dash={[6, 4]}
                        listening={false}
                      />
                      {handlePoints.map((point, index) => (
                        <Rect
                          key={`${component.id}-handle-${index}`}
                          x={point.x - 3}
                          y={point.y - 3}
                          width={6}
                          height={6}
                          fill="#facc15"
                          listening={false}
                        />
                      ))}
                    </>
                  )}
                </Group>
              )
            })}
          </Layer>
        </Stage>
      </div>
    </section>
  )
}
