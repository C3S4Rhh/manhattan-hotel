# Documentación de Base de Datos - Hotel Manhattan

## 1. Entidades Principales

### Habitaciones (`habitaciones`)
Control de inventario físico de las habitaciones.
- `id`: UUID (PK)
- `numero`: Texto (Único, ej: '301')
- `tipo`: Texto (Triple, Simple, Matrimonial, Familiar, Doble)
- `piso`: Entero (3, 4, 5, 6)
- `estado_actual`: Texto (Leyenda: L=Limpio, LO=Limpio/Ocupado, S=Sucio, S-12=Sucio/12pm)

### Hospedajes (`hospedajes`)
Registro de entradas y control de pagos (Formulario Check-in).
- `id`: UUID (PK)
- `nombre_huesped`: Texto
- `nro_pax`: Entero (Cantidad de personas)
- `precio_acordado`: Numérico
- `a_cuenta`: Numérico (Pagos parciales)
- `saldo_total`: Numérico (Calculado: precio - a_cuenta)
- `responsable`: Texto (Firma de quien autoriza/recibe)

### Control de Limpieza (`control_limpieza`)
Gestión de insumos y mantenimiento (Imagen 2).
- `shampoo_cant`, `jabon_cant`, `ph_cant`: Enteros
- `camarera`: Texto
- `responsable_revision`: Texto