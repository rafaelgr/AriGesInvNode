// funciones correspondientes a la página inventario.html
var InvetarioApp = {};

(function(app) {
    // definición variables globales
    var $ean = $('#txtEan'),
        $cantidad = $('#txtCantidad'),
        $msg = $('#txtMsg'),
        $almacenes = $('#almacenes'),
        $stock = $('#txtStock'),
        $precio = $('#txtPrecio'),
        $nombre = $('#txtNombre')
    var codArtic = 0,
        codAlmac = 0,
        cantidad = 0,
        stock = 0,
        codigope = 0,
        importe = 0;
    var articulo = null;
    var datos = [];
    var almacenes = [];
    var almacen = function(codigo, nombre) {
            this.Codigo = codigo;
            this.Nombre = nombre;
        }
        // parametrización numeral
    numeral.language('es', {
        delimiters: {
            thousands: '.',
            decimal: ','
        }
    });
    numeral.language('es');
    // definición de funciones.
    app.int = function() {
        $('#frmEan').submit(function(e) {
            e.preventDefault();
        });
        app.bindings();
    }
    app.bindings = function() {
        $ean.keypress(function(e) {
            if (e.keyCode == 13)
                $('#btnEan').click();
        });
        $almacenes.change(function() {
            // han cambiado de almacén y hay que mostrar
            // los datos correspondientes
            for (var i = 0; i < datos.length; i++) {
                if (datos[i].CodigoAlmacen == $almacenes.val()) {
                    $stock.text(numeral(parseFloat(datos[i].Stock)).format('#,###,##0.00'));
                    $precio.text(numeral(parseFloat(datos[i].PrecioConIva)).format('#,###,##0.00'));
                    codAlmac = datos[i].CodigoAlmacen;
                    stock = datos[i].Stock;
                    articulo = datos[i];
                }
            }
        });
        $('#btnEan').click(function() {
            if (!app.validateFormEan())
                return;
            // leemos el artículo del que nos han proporcionado el EAN.
            var data = {
                "ean": $ean.val()
            }
            $.ajax({
                type: "POST",
                url: "/api/inventario/GetArticuloEan",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // Regresa el mensaje
                    if (!data) {
                        // 
                        $msg.text('No existe ningún artículo con ese ean');
                        $.mobile.changePage('#pgMsg', {
                            transition: 'pop',
                            role: 'dialog'
                        });
                    } else {
                        // para comprobaciones en inventario
                        articulo = data;

                        data = {
                                "ean": $ean.val()
                            }
                            // ahora sí que vamos a buscar stock para inventariar.
                        $.ajax({
                            type: "POST",
                            url: "/api/inventario/GetArticulosEan",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function(data, status) {
                                $ean.val('');
                                // Regresa el mensaje
                                if (!data) {
                                    // 
                                    $msg.text('No hay datos de stock de este artículo');
                                    $.mobile.changePage('#pgMsg', {
                                        transition: 'pop',
                                        role: 'dialog'
                                    });
                                } else {
                                    // antes de asignar iniciamos variables
                                    datos = [];
                                    almacenes = [];
                                    // montamos los datos
                                    datos = data;
                                    // ahora montamos los almacenes para el desplegable
                                    var alHtml = "";
                                    for (var i = 0; i < datos.length; i++) {
                                        var al = new almacen(datos[i].CodigoAlmacen, datos[i].NombreAlmacen);
                                        if (i == 0) {
                                            alHtml += "<option selected value='" + al.Codigo + "'>" + al.Nombre + "</option>";
                                        } else {
                                            alHtml += "<option value='" + al.Codigo + "'>" + al.Nombre + "</option>";
                                        }
                                        almacenes.push(al);
                                    }
                                    // cargamos los valores del desplegable (por defecto seleccionado el 0)
                                    $almacenes.html(alHtml);


                                    /*
                                    var option = ""
                                    $almacenes.empty();
                                    for (var i = 0; i < datos.length; i++) {
                                        var al = new almacen(datos[i].CodigoAlmacen, datos[i].NombreAlmacen);
                                        if (i == 0) {
                                            option += "<option selected value='" + al.Codigo + "'>" + al.Nombre + "</option>";
                                        } else {
                                            option += "<option value='" + al.Codigo + "'>" + al.Nombre + "</option>";
                                        }
                                        almacenes.push(al);
                                        $almacenes.append(option);
                                    }
                                    //$almacenes.selectmenu("refresh", true);
                                    */

                                    // los valores a los campos correspondientes
                                    $nombre.text(datos[0].NombreArticulo);
                                    $stock.text(numeral(parseFloat(datos[0].Stock)).format('#,###,##0.00'));
                                    $precio.text(numeral(parseFloat(datos[0].PrecioConIva)).format('#,###,##0.00'));
                                    codArtic = datos[0].CodigoArticulo;
                                    stock = datos[0].Stock;
                                    codAlmac = datos[0].CodigoAlmacen;
                                    importe = datos[0].PrecioUc;
                                    // mostramos la página
                                    $.mobile.changePage('#pgArt');
                                    if ($("#almacenes")) {
                                        $("#almacenes").selectmenu("refresh");
                                    }

                                }
                            },
                            error: function(xhr, textStatus, errorThrwon) {
                                var m = xhr.responseText;
                                if (!m)
                                    m = "Error general posiblemente falla la conexión";
                                $msg.text(m);
                                $.mobile.changePage('#pgMsg', {
                                    transition: 'pop',
                                    role: 'dialog'
                                });
                            }
                        });
                    }
                },
                error: function(xhr, textStatus, errorThrwon) {
                    var m = xhr.responseText;
                    if (!m)
                        m = "Error general posiblemente falla la conexión";
                    $msg.text(m);
                    $.mobile.changePage('#pgMsg', {
                        transition: 'pop',
                        role: 'dialog'
                    });
                }
            });
            // leer los artículo y el stock
        });
        $('#btnActStock').click(function() {
            // actualizar el stock con la cantidad
            if (!app.validateFormArt())
                return;
            // recogemos la cantidad
            cantidad = $cantidad.val();
            var userAriFace = JSON.parse(getCookie("userAriFace"));
            var data = {
                "codartic": codArtic,
                "codalmac": codAlmac,
                "stock": stock,
                "cantidad": cantidad,
                "importe": importe,
                "codigope": userAriFace.Codtraba
            };
            if (articulo.Status == 1) {
                $msg.text('Este artículo ya está inventariándose en este almacén.');
                $.mobile.changePage('#pgMsg', {
                    transition: 'pop',
                    role: 'dialog'
                });
                return;
            }
            $.ajax({
                type: "POST",
                url: "/api/inventario/SetInventario",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    $cantidad.val('');
                    // Regresa el mensaje
                    if (!data) {
                        // mostrarMensaje('Login y/o password incorrectos');
                        $msg.text('No se ha obtenido respuesta, revise conexiones.');
                        $.mobile.changePage('#pgMsg', {
                            transition: 'pop',
                            role: 'dialog'
                        });
                    } else {
                        if (data == "*") {
                            $msg.css('color', 'blue');
                            $msg.text("Inventario actualizado correctamente.");
                            $.mobile.changePage('#pgMsg', {
                                transition: 'pop',
                                role: 'dialog'
                            });
                        } else {
                            $msg.text(data);
                            $.mobile.changePage('#pgMsg', {
                                transition: 'pop',
                                role: 'dialog'
                            });
                        }
                        //$.mobile.changePage('inventario.html', {"reloadPage":true});
                        //window.open('inventario.html', '_self');
                    }
                },
                error: function(xhr, textStatus, errorThrwon) {
                    var m = xhr.responseText;
                    if (!m)
                        m = "Error general posiblemente falla la conexión";
                    $msg.text(m);
                    $.mobile.changePage('#pgMsg', {
                        transition: 'pop',
                        role: 'dialog'
                    });
                }
            });
        });
    }
    app.validateFormEan = function() {
        $('#frmEan').validate({
            rules: {
                ean: {
                    required: true
                }
            },
            messages: {
                ean: {
                    required: 'Introduzca un código de barras'
                }
            },
            errorPlacement: function(error, element) {
                error.insertAfter(element.parent());
            }
        });
        return $('#frmEan').valid();
    }
    app.validateFormArt = function() {
        $('#frmArt').validate({
            rules: {
                cantidad: {
                    required: true,
                    min: 0
                }
            },
            messages: {
                cantidad: {
                    required: 'Introduzca una cantidad',
                    min: 'El valor no puede negativo'
                }
            },
            errorPlacement: function(error, element) {
                error.insertAfter(element.parent());
            }
        });
        return $('#frmArt').valid();
    }
    app.int();
})(InvetarioApp);
