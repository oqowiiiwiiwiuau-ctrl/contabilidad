import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">

      <nav>
        <Link to="/">
          🏠 <span>Inicio</span>
        </Link>

        <Link to="/cuentas">
          📒 <span>Plan de cuentas</span>
        </Link>

        <Link to="/asientos">
          📝 <span>Asientos</span>
        </Link>

        <Link to="/libros">
          📖 <span>Libros</span>
        </Link>

        <Link to="/reportes">
          📊 <span>Reportes</span>
        </Link>
      </nav>

    </aside>
  )
}

export default Sidebar
