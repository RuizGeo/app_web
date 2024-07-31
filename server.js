const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

// Servir arquivos estáticos na raiz do projeto
app.use(express.static(path.join(__dirname)));

// Servir o arquivo index.html para qualquer rota não especificada
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});