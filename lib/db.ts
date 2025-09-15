import clientPromise from "./mongodb"

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db("ecommerce1")
  return { client, db }
}

// Products
export async function getProducts(query = {}, limit = 0, sort = {}) {
  const { db } = await connectToDatabase()
  return db.collection("products").find(query).limit(limit).sort(sort).toArray()
}

export async function getProductById(id) {
  const { db } = await connectToDatabase()
  return db.collection("products").findOne({ _id: id })
}

// Categories
export async function getCategories() {
  const { db } = await connectToDatabase()
  return db.collection("categories").find({}).toArray()
}

// Orders
export async function createOrder(orderData) {
  const { db } = await connectToDatabase()
  return db.collection("orders").insertOne(orderData)
}

export async function getOrdersByUser(userId) {
  const { db } = await connectToDatabase()
  return db.collection("orders").find({ userId }).toArray()
}

// Users
export async function getUserById(id) {
  const { db } = await connectToDatabase()
  return db.collection("users").findOne({ _id: id })
}

export async function updateUser(id, updateData) {
  const { db } = await connectToDatabase()
  return db.collection("users").updateOne({ _id: id }, { $set: updateData })
}
