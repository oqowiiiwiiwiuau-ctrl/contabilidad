function Dashboard() {
  return (
    <div>

      <section className="empresa">
        <h2>Empresa de Prueba</h2>

        <div className="datos-empresa">
          <span>NIT: 0000000000</span>
          <span>Moneda: BOB</span>
        </div>
      </section>

      <section>

        <h2>¿Qué deseas hacer?</h2>

        <div className="acciones">

          <button>
            <span className="icono">📝</span>
            <span className="titulo">Asientos</span>
            <span className="descripcion">
              Registrar asientos contables
            </span>
          </button>

          <button>
            <span className="icono">📒</span>
            <span className="titulo">Plan de cuentas</span>
            <span className="descripcion">
              Administrar cuentas contables
            </span>
          </button>

          <button>
            <span className="icono">📖</span>
            <span className="titulo">Libros</span>
            <span className="descripcion">
              Consultar libros contables
            </span>
          </button>

          <button>
            <span className="icono">📊</span>
            <span className="titulo">Reportes</span>
            <span className="descripcion">
              Generar estados financieros
            </span>
          </button>

        </div>

      </section>

    </div>
  )
}

export default Dashboard
