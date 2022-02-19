const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const existCpf = customers.some((customer) => customer.cpf === cpf);

  if (existCpf) {
    return response
      .json({
        message: "Cpf early exist",
      })
      .status(400);
  }

  const id = uuidv4();
  const customer = {
    id,
    cpf,
    name,
    statement: [],
  };

  customers.push(customer);
  response.json(customer).status(201);
});

app.listen(3333, () => {
  console.log(`listening on http://localhost:3333`);
});
