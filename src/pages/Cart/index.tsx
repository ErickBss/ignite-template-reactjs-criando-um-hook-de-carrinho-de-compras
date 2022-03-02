import React from 'react'
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md'

import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../util/format'
import { Container, ProductTable, Total } from './styles'

interface Product {
  id: number
  title: string
  price: number
  image: string
  amount: number
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount, addProduct } = useCart()

  const cartFormatted = cart.map((product) => ({
    id: product.id,
    amount: product.amount,
    title: product.title,
    image: product.image,
    priceFormatted: formatPrice(product.price),
    subTotal: formatPrice(product.price * product.amount),
  }))

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      const subTotal = product.price * product.amount
      sumTotal = subTotal + sumTotal

      console.log(sumTotal)
      return sumTotal
    }, 0)
  )

  function handleProductIncrement(product: Product) {
    const increaseProductAmount = {
      productId: product.id,
      amount: product.amount + 1,
    }

    updateProductAmount(increaseProductAmount)
  }
  function handleProductDecrement(product: Product) {
    const decreaseProductAmount = {
      productId: product.id,
      amount: product.amount - 1,
    }

    updateProductAmount(decreaseProductAmount)
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((cartProduct, index) => {
            return (
              <tr data-testid="product" key={cartProduct.id}>
                <td>
                  <img src={cartProduct.image} alt={cartProduct.title} />
                </td>
                <td>
                  <strong>{cartProduct.title}</strong>
                  <span>{cartProduct.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={cartProduct.amount <= 1}
                      onClick={() => handleProductDecrement(cart[index])}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={cartProduct.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(cart[index])}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{cartProduct.subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(cartProduct.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  )
}

export default Cart
