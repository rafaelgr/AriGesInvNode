// javascript de soporte a la página index.html
var LoginApp = {};

(function (app) {
    // definición de variabels globales
    var $login = $('#txtLogin'),
        $password = $('#txtPassword'),
        $msg = $('#txtMsg')

    // definición de funciones
    app.init = function () {
        $('#frmLogin').submit(function (e) {
            e.preventDefault();
        });
        app.bindings();
    }
    app.bindings = function () {
        $('#btnLogin').click(function (e) {
            // eliminamos el comportamiento por defecto
            e.preventDefault();
            // comprobamos que tenemos los campos necesarios
            if (!app.validateForm()) return;
            // ahora hacemos el login
            var data = {
                "login": $login.val(),
                "password": $password.val()
            };
            $.ajax({
                type: "POST",
                url: "/api/login/GetLogin",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Regresa el mensaje
                    if (!data) {
                        // mostrarMensaje('Login y/o password incorrectos');
                        $msg.text('Login y/o password incorrectos');
                        $.mobile.changePage('#pgMsg', { transition: 'pop', role: 'dialog' });
                    } else {
                        //$.mobile.changePage('inventario.html', {"reloadPage":true});
                        setCookie('userAriFace', JSON.stringify(data), 1);
                        window.open('inventario.html', '_self');
                    }
                },
                error: function (xhr, textStatus, errorThrwon) {
                    var m = xhr.responseText;
                    if (!m) m = "Error general posiblemente falla la conexión";
                    $msg.text(m);
                    $.mobile.changePage('#pgMsg', { transition: 'pop', role: 'dialog' });
                }
            });
        });
    }
    // gestiona las validaciones de los campos del form
    app.validateForm = function () {
        $('#frmLogin').validate({
            rules: {
                login: { required: true },
                password: { required: true }
            },
            messages: {
                login: {
                    required: 'Introduzca un login'
                },
                password: {
                    required: 'Introduzca una contraseña'
                }
            },
            errorPlacement: function (error, element) {
                error.insertAfter(element.parent());
            }
        });
        return $('#frmLogin').valid();
    }
    // inicio de aplicación
    app.init();
})(LoginApp);