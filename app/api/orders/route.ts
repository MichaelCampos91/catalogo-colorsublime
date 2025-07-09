import { NextResponse } from "next/server"
import { createOrder, getOrders, getOrdersByDate, updateOrderStatus, getOrdersByOrderNumber } from "@/lib/database"

export async function POST(request: Request) {
  try {
    console.log("API: Criando novo pedido...")
    const body = await request.json()
    const order = await createOrder(body)
    console.log("API: Pedido criado com sucesso")
    return NextResponse.json(order)
  } catch (error) {
    console.error("API: Erro ao criar pedido:", error)
    // Garantir que sempre retornamos JSON válido mesmo em caso de erro
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const orderNumber = searchParams.get("order")

    let orders
    if (orderNumber) {
      orders = await getOrdersByOrderNumber(orderNumber)
    } else if (date) {
      orders = await getOrdersByDate(date)
    } else {
      orders = await getOrders()
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("API: Erro ao buscar pedidos:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ID do pedido é obrigatório" }, { status: 400 })
    }

    console.log(`API: Concluindo pedido ${id}...`)
    const updatedOrder = await updateOrderStatus(id, false)

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("API: Erro ao concluir pedido:", error)
    return NextResponse.json(
      {
        error: "Erro ao concluir pedido",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
