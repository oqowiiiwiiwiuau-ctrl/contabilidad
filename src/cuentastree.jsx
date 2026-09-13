// src/components/contabilidad/CuentaTree.jsx
import { useState } from 'react'

export default function CuentaTree({ cuentas, onSelect, showBadge = true }) {
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
        a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
      )
      nodes.forEach(n => sortRec(n.children))
    }
    sortRec(roots)

    return roots
  }

  const tree = buildTree(cuentas)

  if (!cuentas.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay cuentas para mostrar.
      </div>
    )
  }

  return (
    <div className="font-mono text-sm">
      {tree.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          showBadge={showBadge}
          depth={0}
        />
      ))}
    </div>
  )
}

function TreeNode({ node, onSelect, showBadge, depth }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children?.length > 0

  const tipoColor = {
    ACTIVO: 'bg-blue-100 text-blue-700',
    PASIVO: 'bg-red-100 text-red-700',
    PATRIMONIO: 'bg-purple-100 text-purple-700',
    INGRESO: 'bg-green-100 text-green-700',
    GASTO: 'bg-orange-100 text-orange-700',
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => {
          if (hasChildren) setOpen(!open)
          onSelect?.(node)
        }}
      >
        <span className="w-4 text-gray-400 select-none">
          {hasChildren ? (open ? '▼' : '▶') : '·'}
        </span>

        <span className="text-gray-500 w-28 shrink-0">{node.codigo}</span>

        <span
          className={`flex-1 truncate ${
            !node.activa ? 'line-through text-gray-400' : ''
          }`}
        >
          {node.nombre}
        </span>

        {showBadge && node.tipo && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              tipoColor[node.tipo] || 'bg-gray-100'
            }`}
          >
            {node.tipo}
          </span>
        )}

        {node.permite_movimientos && (
          <span className="text-xs text-green-600" title="Permite movimientos">
            ●
          </span>
        )}
      </div>

      {open && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              showBadge={showBadge}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}