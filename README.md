# Gym Manager App 🏋️‍♂️

Sistema de gestión integral para gimnasios y centros deportivos. Una aplicación moderna, rápida y con una interfaz optimizada en modo oscuro, diseñada para facilitar el control de socios, cobros y estadísticas mensuales.

## 🚀 Características Principales

### 📊 Dashboard Inteligente

- **Resumen en tiempo real:** Visualización rápida de socios activos e inactivos.
- **Acciones Directas:** Desde la tarjeta de socios inactivos, se puede abrir un listado para renovar pagos o eliminar socios sin navegar por otros menús.
- **Sincronización Automática:** El sistema detecta automáticamente si una suscripción ha vencido y actualiza el estado del socio en la base de datos al instante.
- **Calendario Integrado:** Consulta de fechas rápida mediante componentes de PrimeNG.

### 👥 Gestión de Socios

- **Ficha Completa:** Registro de datos personales, DNI, teléfono, tarifa asignada y método de pago preferido.
- **Validaciones Robustas:**
  - Formato de DNI (8 números y 1 letra).
  - Detección de DNI duplicados antes de guardar.
  - Campos obligatorios validados mediante formularios reactivos.
- **Sistema de Vencimiento:** Indicadores visuales (Verde/Rojo) en la tabla principal según la fecha de expiración de la cuota.
- **Renovación Ágil:** Botón de cobro rápido que actualiza la fecha de alta del socio y genera un registro de ingreso automáticamente.

### 💳 Control de Ingresos e Historial

- **Registro Automatizado:** Los pagos se generan tanto en nuevas altas como en renovaciones.
- **Filtros Avanzados:** Búsqueda por rango de fechas para cierres de caja semanales o mensuales.
- **Reinicio Anual Visual:** La lista se filtra por defecto para mostrar el año en curso, manteniendo la interfaz limpia.
- **Exportación de Datos:** Botón para descargar el historial de pagos filtrado en formato CSV compatible con Excel.
- **Estadísticas en Firebase:** Almacenamiento de cierres mensuales para consultas históricas.

### 🏷️ Configuración de Tarifas

- **Flexibilidad:** Creación de tarifas con nombres, precios y duraciones personalizadas (en días).
- **Orden dinámico:** Clasificación por duración para facilitar la selección.

## 🛠️ Stack Tecnológico

- **Frontend:** [Angular 21](https://angular.io/) (Standalone Components).
- **UI Library:** [PrimeNG](https://primeng.org/) (Aura Theme - Dark Mode).
- **Backend & DB:** [Firebase Firestore](https://firebase.google.com/docs/firestore).
- **Notificaciones:** [SweetAlert2](https://sweetalert2.github.io/) para diálogos de confirmación y alertas de éxito/error.
- **Estilos:** SCSS con arquitectura modular y encapsulación profunda (`::ng-deep`) para personalización de componentes externos.

## 📂 Estructura del Proyecto

- `src/app/components/`: Componentes principales (Dashboard, Clientes, Tarifas, Pagos).
- `src/app/services/`: Lógica de comunicación con Firebase (Firestore SDK).
- `src/app/models/`: Interfaces de TypeScript para definir la estructura de Clientes, Tarifas y Pagos.
- `src/styles.scss`: Definiciones globales, variables de color y reseteos de UI.

## 🎨 Identidad Visual

La aplicación utiliza una paleta de colores de alto contraste sobre fondo oscuro:

- **Fondo Primario:** `#0c0c0c` / `#1e1e1e`.
- **Verde Corporativo:** `#81c784` (Usado en botones de éxito, logos y textos positivos).
- **Rojo Alerta:** `#ff8a80` (Vencimientos, errores y acciones de borrado).
- **Tipografía:** Inter / System Sans-serif para máxima legibilidad.

## ⚙️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Firebase:**
    Modifica el archivo `src/environments/environment.ts` con tus credenciales de Firebase:
    ```typescript
    export const environment = {
      firebase: {
        apiKey: '...',
        authDomain: '...',
        projectId: '...',
        storageBucket: '...',
        messagingSenderId: '...',
        appId: '...',
      },
    };
    ```
4.  **Ejecutar en desarrollo:**
    ```bash
    ng serve
    npm run electron (solo si quieres arrancarlo encapsulado en Electron)
    npm run package-electron (solo si quieres encampularlo en Electron generando un archivo ejecutable de Windows para instalación), en caso de error con este comando, reinstalar electron.builder (npm install --save-dev electron-builder), al ejecutarlo, debería aparecer una carpeta llamada release.
    ```
    La aplicación estará disponible en `http://localhost:4200`.

## 📝 Notas de Mantenimiento

- **Cierres Estadísticos:** La aplicación guarda automáticamente un resumen del total recaudado del mes en la colección `estadisticas_mensuales` cada vez que se consulta el historial de pagos.
- **Z-Index:** Se ha configurado SweetAlert2 para que use el `target: 'body'` y así evitar que quede oculto tras los modales de PrimeNG.

---

Desarrollado con ❤️ para la gestión deportiva eficiente.
