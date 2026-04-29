const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const publicPath = path.join(__dirname, 'public');

app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/js', express.static(path.join(publicPath, 'js')));
app.use('/data', express.static(path.join(publicPath, 'data')));
app.use('/imagenes', express.static(path.join(publicPath, 'imagenes')));
app.use('/animales', express.static(path.join(publicPath, 'animales')));
app.use('/numeros', express.static(path.join(publicPath, 'numeros')));
app.use('/colores', express.static(path.join(publicPath, 'colores')));
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});