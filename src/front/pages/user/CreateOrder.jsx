import { useState, useEffect } from "react"
import { Search, Filter } from 'lucide-react'
import ProductCard from "../../components/user/ProductCard"
import CurrentOrder from "../../components/user/CurrentOrder"
import { showError, showInfo, showSuccess } from "../../utils/toastUtils"
import { colors, typography, spacing, borderRadius } from '../../theme'

function CreateOrder() {
    const [products, setProducts] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isToGo, setIsToGo] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [error, setError] = useState(null)

    // Filter states
    const [filterType, setFilterType] = useState("all")
    const [showFilters, setShowFilters] = useState(false)

    // Estados para paginación desde el backend
    const [paginaActual, setPaginaActual] = useState(1)
    const [elementosPorPagina, setElementosPorPagina] = useState(10)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [totalElementos, setTotalElementos] = useState(0)

    const fetchProducts = async (page = 1, perPage = 10, search = "", type = "all") => {
        try {
            setLoadingProducts(true)
            setError(null)

            // Obtener el token de autenticación
            const token = sessionStorage.getItem("access_token")

            // Construir URL con parámetros de paginación y filtros
            let url = `${import.meta.env.VITE_BACKEND_URL}/api/productos?page=${pagina}&per_page=${porPagina}`

            // Añadir búsqueda si existe
            if (buscar.trim() !== "") {
                url += `&search=${encodeURIComponent(buscar)}`
            }

            // Añadir filtro de tipo si no es "todos"
            if (tipo !== "todos") {
                url += `&tipo=${tipo}`
            }

            // Realizar la petición al endpoint
            const response = await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error(`Error al cargar productos: ${response.status}`)
            }

            const data = await response.json()

            // Filtrar solo productos activos y mapear a la estructura que usa el componente
            const productosFormateados = (data.items || [])
                .filter(producto => producto.is_active)
                .map(producto => ({
                    id: producto.id,
                    nombre: producto.name,
                    precio: producto.price,
                    imagen: producto.url_img,
                    descripcion: producto.description,
                    tipo: producto.tipo,
                    type: producto.type
                }))

            setProductos(productosFormateados)

            // Update pagination states
            setCurrentPage(data.page || 1)
            setTotalPages(data.pages || 1)
            setItemsPerPage(data.per_page || 10)
            setTotalItems(data.total || 0)

        } catch (err) {
            console.error("Error loading products:", err)
            setError(err.message)
        } finally {
            setLoadingProducts(false)
        }
    }

    useEffect(() => {
        fetchProducts(currentPage, itemsPerPage, searchQuery, filterType)
    }, [currentPage, itemsPerPage, searchQuery, filterType])

    const agregarProducto = (producto) => {
        const productoExistente = ordenActual.find((item) => item.id === producto.id)

        if (productoExistente) {
            setOrdenActual(
                ordenActual.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)),
            )
        } else {
            setOrdenActual([...ordenActual, { ...producto, cantidad: 1 }])
        }
    }

    const eliminarProducto = (id) => {
        setOrdenActual(ordenActual.filter((item) => item.id !== id))
    }

    const cambiarCantidad = (id, cantidad) => {
        if (cantidad <= 0) {
            eliminarProducto(id)
            return
        }

        setOrdenActual(ordenActual.map((item) => (item.id === id ? { ...item, cantidad } : item)))
    }

    const crearOrden = async () => {
        // Verify if there are products in the order
        if (ordenActual.length === 0) {
            showInfo("No products in the order");
            return;
        }

        try {
            setLoading(true);

            // Map products to the format expected by the backend
            const products = ordenActual.map(item => ({
                id: item.id,
                quantity: item.cantidad,
                price: item.precio
            }));

            // Get authentication token
            const token = sessionStorage.getItem("access_token");

            // Prepare request body
            const orderData = {
                products: products,
                take_away: paraLlevar
            };

            // Send request to backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(data.message || "Order created successfully");
                setOrdenActual([]);
                setParaLlevar(false);
            } else {
                showError(data.error || "Error creating order");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            showError("There was an error processing your request");
        } finally {
            setLoading(false);
        }
    };

    const toggleFiltros = () => {
        setMostrarFiltros(!mostrarFiltros)
    }

    const aplicarFiltros = () => {
        fetchProductos(1, elementosPorPagina, busqueda, filtroTipo)
    }

    const limpiarFiltros = () => {
        setBusqueda("")
        setFiltroTipo("todos")
        fetchProductos(1, elementosPorPagina, "", "todos")
    }

    const buscarProductos = () => {
        fetchProductos(1, elementosPorPagina, busqueda, filtroTipo)
    }

    // Funciones para la paginación
    const irAPagina = (numeroPagina) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            fetchProductos(numeroPagina, elementosPorPagina, busqueda, filtroTipo)
        }
    }

    const irAPaginaAnterior = () => {
        if (paginaActual > 1) {
            fetchProductos(paginaActual - 1, elementosPorPagina, busqueda, filtroTipo)
        }
    }

    const irAPaginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            fetchProductos(paginaActual + 1, elementosPorPagina, busqueda, filtroTipo)
        }
    }

    const cambiarElementosPorPagina = (nuevaCantidad) => {
        setElementosPorPagina(nuevaCantidad)
        fetchProductos(1, nuevaCantidad, busqueda, filtroTipo)
    }

    // Generar números de página para mostrar
    const generarNumerosPagina = () => {
        const paginas = []
        const maxPaginasMostradas = 5

        let paginaInicial = Math.max(1, paginaActual - Math.floor(maxPaginasMostradas / 2))
        let paginaFinal = Math.min(totalPaginas, paginaInicial + maxPaginasMostradas - 1)

        // Ajustar si estamos cerca del final
        if (paginaFinal - paginaInicial + 1 < maxPaginasMostradas) {
            paginaInicial = Math.max(1, paginaFinal - maxPaginasMostradas + 1)
        }

        for (let i = paginaInicial; i <= paginaFinal; i++) {
            paginas.push(i)
        }

        return paginas
    }

    // Calcular índices para mostrar información de paginación
    const indiceInicial = (paginaActual - 1) * elementosPorPagina + 1
    const indiceFinal = Math.min(indiceInicial + elementosPorPagina - 1, totalElementos)

    const containerStyles = {
        padding: spacing.xl,
        backgroundColor: colors.neutral.lightestGray,
        minHeight: '100vh',
    };

    const headerStyles = {
        marginBottom: spacing.xl,
    };

    const titleStyles = {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral.black,
        marginBottom: spacing.md,
    };

    const searchBarStyles = {
        display: 'flex',
        gap: spacing.md,
        marginBottom: mostrarFiltros ? spacing.md : 0,
    };

    const inputStyles = {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.neutral.lightGray}`,
        fontSize: typography.fontSize.base,
        '&:focus': {
            outline: 'none',
            borderColor: colors.primary.main,
        },
    };

    const filterButtonStyles = {
        backgroundColor: mostrarFiltros ? colors.primary.main : colors.neutral.white,
        color: mostrarFiltros ? colors.neutral.white : colors.primary.main,
        border: `1px solid ${colors.primary.main}`,
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: borderRadius.md,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
            backgroundColor: colors.primary.light,
            borderColor: colors.primary.light,
            color: colors.neutral.white,
        },
    };

    const filterContainerStyles = {
        backgroundColor: colors.neutral.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    };

    const selectStyles = {
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        border: `1px solid ${colors.neutral.lightGray}`,
        fontSize: typography.fontSize.base,
        color: colors.neutral.darkGray,
        '&:focus': {
            outline: 'none',
            borderColor: colors.primary.main,
        },
    };

    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: spacing.xl,
        marginBottom: spacing.xl,
    };

    return (
        <div style={containerStyles}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        <div style={headerStyles}>
                            <h1 style={titleStyles}>Crear Nuevo Pedido</h1>

                            <div style={searchBarStyles}>
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    style={inputStyles}
                                />
                                <button
                                    className="btn"
                                    style={filterButtonStyles}
                                    onClick={toggleFiltros}
                                >
                                    <Filter size={20} />
                                    Filtros
                                </button>
                            </div>

                            {mostrarFiltros && (
                                <div style={filterContainerStyles}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label style={{
                                                fontSize: typography.fontSize.sm,
                                                color: colors.neutral.darkGray,
                                                marginBottom: spacing.xs,
                                            }}>
                                                Tipo de Producto
                                            </label>
                                            <select
                                                value={filtroTipo}
                                                onChange={(e) => setFiltroTipo(e.target.value)}
                                                style={selectStyles}
                                                className="form-select"
                                            >
                                                <option value="todos">Todos</option>
                                                <option value="comida">Comida</option>
                                                <option value="bebida">Bebida</option>
                                                <option value="postre">Postre</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {loadingProductos ? (
                            <div style={{
                                textAlign: 'center',
                                padding: spacing.xl,
                                color: colors.neutral.gray,
                            }}>
                                Cargando productos...
                            </div>
                        ) : error ? (
                            <div style={{
                                padding: spacing.lg,
                                backgroundColor: colors.status.errorLight,
                                color: colors.status.error,
                                borderRadius: borderRadius.md,
                                marginBottom: spacing.xl,
                            }}>
                                {error}
                            </div>
                        ) : (
                            <>
                                <div style={gridStyles}>
                                    {productos.map((producto) => (
                                        <ProductCard
                                            key={producto.id}
                                            producto={producto}
                                            onAgregar={() => agregarProducto(producto)}
                                        />
                                    ))}
                                </div>

                                {/* Pagination controls */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: spacing.sm,
                                    marginBottom: spacing.xl,
                                }}>
                                    <button
                                        className="btn"
                                        style={{
                                            ...filterButtonStyles,
                                            opacity: paginaActual === 1 ? 0.5 : 1,
                                        }}
                                        onClick={irAPaginaAnterior}
                                        disabled={paginaActual === 1}
                                    >
                                        Anterior
                                    </button>

                                    {generarNumerosPagina().map((pagina) => (
                                        <button
                                            key={pagina}
                                            className="btn"
                                            style={{
                                                ...filterButtonStyles,
                                                backgroundColor: paginaActual === pagina ? colors.primary.main : colors.neutral.white,
                                                color: paginaActual === pagina ? colors.neutral.white : colors.primary.main,
                                            }}
                                            onClick={() => irAPagina(pagina)}
                                        >
                                            {pagina}
                                        </button>
                                    ))}

                                    <button
                                        className="btn"
                                        style={{
                                            ...filterButtonStyles,
                                            opacity: paginaActual === totalPaginas ? 0.5 : 1,
                                        }}
                                        onClick={irAPaginaSiguiente}
                                        disabled={paginaActual === totalPaginas}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <OrdenActual
                            items={ordenActual}
                            paraLlevar={paraLlevar}
                            setParaLlevar={setParaLlevar}
                            cambiarCantidad={cambiarCantidad}
                            eliminarProducto={eliminarProducto}
                            crearOrden={crearOrden}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrearOrden