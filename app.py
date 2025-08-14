from flask import Flask, jsonify, render_template
import random
import os

# Se inicializa la aplicación Flask
# La variable se llama 'app' para que Render la reconozca.
# Se indica a Flask que busque las plantillas en la carpeta 'templates'.
app = Flask(__name__, template_folder='templates')

# Esta es la ruta principal que sirve tu página de inicio (home.html)
@app.route('/')
def home():
    return render_template('home.html')

# Esta es la ruta de tu API que entregará los datos a la página web
@app.route('/api/datos')
def obtener_datos():
    # Simula los datos de un dispositivo ESP32
    distancia = random.uniform(20.0, 300.0)
    bateria = random.uniform(10.0, 100.0)
    latitud = random.uniform(22.25, 22.26)
    longitud = random.uniform(-97.83, -97.84)
    
    datos = {
        "distancia_cm": distancia,
        "bateria_porcentaje": bateria,
        "hora": "12:34:56", # Esto debería ser la hora real del ESP32
        "latitud": f"{latitud:.6f}",
        "longitud": f"{longitud:.6f}"
    }
    return jsonify(datos)

# Configuración para que Flask se ejecute en Render
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
