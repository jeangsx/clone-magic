# Editar la página desde Shopify (plantilla)

Esta web toma textos e imágenes editables desde **Shopify Admin**. No usa el Theme Editor de Online Store: usa **Metaobjects** y **Metafields**.

## 1. Metaobject global `landing_settings`

1. En Shopify Admin ve a **Configuración → Datos personalizados → Metaobjects**.
2. Crea una definición con tipo: `landing_settings` (nombre: “Ajustes landing”).
3. En acceso, activa **Storefront API → Lectura**.
4. Añade estos campos (texto de una línea, salvo imagen):

| Campo (key) | Nombre sugerido | Tipo |
|---|---|---|
| `hero_title` | Título hero | Texto de una línea |
| `hero_subtitle` | Subtítulo hero | Texto de una línea |
| `hot_sale_text` | Texto HOT SALE | Texto de una línea |
| `benefit_1` | Beneficio 1 | Texto de una línea |
| `benefit_2` | Beneficio 2 | Texto de una línea |
| `benefit_3` | Beneficio 3 | Texto de una línea |
| `doctor_badge_text` | Badge recomendado | Texto de una línea |
| `guarantee_text` | Texto garantía | Texto de una línea |
| `offers_heading` | Título sección ofertas | Texto de una línea |
| `banner_image` | Imagen banner | Archivo / imagen |
| `hero_urgency` | Urgencia bajo el reloj | Texto de una línea |

5. Crea una **entrada** con handle exacto: `main`.
6. Rellena los campos y guarda.

Ruta típica para editar luego: **Contenido → Metaobjects → Ajustes landing → main**.

## 2. Metafields por producto

1. **Configuración → Datos personalizados → Productos**.
2. Crea metafields en el namespace `custom` (Shopify suele usar `custom` en el admin):

| Key | Nombre | Tipo |
|---|---|---|
| `short_pitch` | Pitch corto | Texto de una línea |
| `benefit_1` | Beneficio 1 | Texto de una línea |
| `benefit_2` | Beneficio 2 | Texto de una línea |
| `benefit_3` | Beneficio 3 | Texto de una línea |
| `badge_text` | Badge oferta | Texto de una línea |

3. En cada definición, activa **Acceso a Storefront API → Lectura pública**.
4. Edita cualquier producto → sección de metafields → guarda.

Si un producto tiene `benefit_1/2/3`, esos textos **reemplazan** los globales solo en ese producto.  
`short_pitch` aparece bajo el título en la tarjeta de oferta.  
La **descripción** del producto (campo nativo de Shopify) se muestra en la página de producto (PDP).

## 3. Qué edita cada cosa

| Qué ves en la web | Dónde editarlo |
|---|---|
| Banner / títulos del hero | Metaobject `landing_settings` → `main` |
| HOT SALE, badge médico, beneficios por defecto | Metaobject `main` |
| Título de “Special Internet-Only Offer” | `offers_heading` |
| Pitch / beneficios de un producto concreto | Metafields del producto |
| Descripción larga | Descripción del producto en Shopify |
| Precio / imágenes / variantes | Producto (campos normales) |

## 4. Si no ves cambios

- Confirma que el metaobject handle es `main` y el type es `landing_settings`.
- Confirma **Storefront API: lectura** en la definición.
- Hard refresh del navegador (Ctrl+F5).
- Los campos vacíos usan textos por defecto de la web (fallback).
