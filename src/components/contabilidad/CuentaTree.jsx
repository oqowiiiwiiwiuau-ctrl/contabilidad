// src/components/contabilidad/CuentaTree.jsx
import { useState } from 'react'

export default function CuentaTree({ cuentas = [], onSelect, showBadge = true }) {
  if (!Array.isArray(cuentas) || cuentas.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#999', padding: 32 }}>
        No hay cuentas para mostrar.
      </div>
    )
  }

  const buildTree = (items) => {
    const map = {}
    const roots = []

    items.forEach(item => {
      map[item.id] = { ...item, children: [] }
    })

    items.forEach(item => {
      if (item.cuenta_padre_id && map[item.cuenta_padre_id]) {
        map[item.cuenta_padre_id].children.push(map[item.id])
      } else {
        roots.push(map[item.id])
      }
    })

    const sortRec = (nodes) => {
      nodes.sort((a, b) =>
        (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true })
      )
      nodes.forEach(n => sortRec(n.children))
    }
    sortRec(roots)

    return roots
  }

  const tree = buildTree(cuentas)

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
      {tree.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          showBadge={showBadge}
          depth={0}
          isLast={false}
          parentLines={[]}
        />
      ))}
    </div>
  )
}

function TreeNode({ node, onSelect, showBadge, depth, isLast, parentLines }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children?.length > 0

  const tipoColor = {
    ACTIVO: { bg: '#dbeafe', color: '#1e40af' },
    PASIVO: { bg: '#fee2e2', color: '#991b1b' },
    PATRIMONIO: { bg: '#ede9fe', color: '#6b21a8' },
    INGRESO: { bg: '#dcfce7', color: '#166534' },
    GASTO: { bg: '#ffedd5', color: '#9a3412' },
  }

  const colores = tipoColor[node.tipo] || { bg: '#f3f4f6', color: '#374151' }

  // Ancho de cada nivel de sangría
  const INDENT = 16
  const ROW_HEIGHT = 28

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: ROW_HEIGHT,
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 4,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        onClick={() => {
          if (hasChildren) setOpen(!open)
          onSelect?.(node)
        }}
      >
        {/* Guías verticales para niveles anteriores */}
        {parentLines.map((hasLine, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * INDENT + 8,
              top: 0,
              bottom: 0,
              width: 1,
              background: hasLine ? '#e5e7eb' : 'transparent',
            }}
          />
        ))}

        {/* Espacio de sangría del nivel actual */}
        <div style={{ width: depth * INDENT + 8, flexShrink: 0 }} />

        {/* Flecha de expandir/colapsar */}
        <div
          style={{
            width: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasChildren ? '#6b7280' : 'transparent',
            userSelect: 'none',
            flexShrink: 0,
            fontSize: 10,
          }}
        >
          {hasChildren ? (open ? '▼' : '▶') : '·'}
        </div>

        {/* Código */}
        <div
          style={{
            color: '#6b7280',
            width: 110,
            flexShrink: 0,
            fontSize: 12,
          }}
        >
          {node.codigo}
        </div>

        {/* Nombre */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: node.activa === false ? 'line-through' : 'none',
            color: node.activa === false ? '#9ca3af' : '#111827',
            fontSize: 13,
          }}
        >
          {node.nombre}
        </div>

        {/* Badge de tipo */}
        {showBadge && node.tipo && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              background: colores.bg,
              color: colores.color,
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            {node.tipo}
          </div>
        )}

        {/* Indicador "permite movimientos" */}
        {node.permite_movimientos && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#16a34a',
              marginLeft: 8,
              marginRight: 8,
              flexShrink: 0,
            }}
            title="Permite movimientos"
          />
        )}
      </div>

      {/* Hijos */}
      {open && hasChildren && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              showBadge={showBadge}
              depth={depth + 1}
              isLast={idx === node.children.length - 1}
              parentLines={[...parentLines, !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  )
}