const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];

// Middleware

function verifyIfExistAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((cstm) => cstm.cpf === cpf);

  if (!customer) {
    return response.json({ message: "Custumer not found" }).status(404);
  }

  request.customer = customer;

  next();
}

function getBalance(statement) {
  return statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    }
    return acc - operation.amount;
  }, 0);
}

//Routes

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
  return response.json(customer).status(201);
});

app.get("/statement", verifyIfExistAccountCPF, (request, response) => {
  return response.json(request.customer.statement).status(200);
});

app.post("/deposit", verifyIfExistAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).json(customer);
});

app.post("/withdraw", verifyIfExistAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount)
    return response
      .json({ message: "Insufficient value for withdraw" })
      .status(400);

  const statementOperation = {
    amount,
    createdAt: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.json(customer);
});

app.get("/statement/date", verifyIfExistAccountCPF, (request, response) => {
  const { date } = request.query;
  const { customer } = request;

  const dateFormat = new Date(date + " 00:00");

  const statements = customer.statement.filter(
    (operation) =>
      operation.createdAt.toDateString() === new Date(dateFormat).toDateString()
  );

  return response.json(statements).status(200);
});

app.put("/account", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  const { name } = request.body;

  customer.name = name;

  return response.json(customer).status(201);
});

app.get("/account", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
});

app.delete("/account", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request;
  customers.splice(customer, 1);
  return response.send("Removido com sucesso");
});

app.listen(3333, () => {
  console.log(`listening on http://localhost:3333`);
});
