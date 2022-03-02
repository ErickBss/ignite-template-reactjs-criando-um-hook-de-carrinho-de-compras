import { resourceUsage } from 'process'
import { createContext, ReactNode, useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'
import { Product, Stock } from '../types'

interface CartProviderProps {
  children: ReactNode
}

interface UpdateProductAmount {
  productId: number
  amount: number
}

interface CartContextData {
  cart: Product[]
  addProduct: (productId: number) => Promise<void>
  removeProduct: (productId: number) => void
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return []
  })

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]
      const productExists = updatedCart.find(
        (product) => product.id === productId
      )

      const stock = await api.get(`/stock/${productId}`).then((response) => {
        return response.data
      })
      const stockAmount = stock.amount

      const currentAmount = productExists ? productExists.amount : 0

      const amount = currentAmount + 1

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (productExists) {
        productExists.amount = amount
      } else {
        const product = await api.get(`/products/${productId}`)

        const updatedProduct = {
          ...product.data,
          amount: 1,
        }
        updatedCart.push(updatedProduct)
      }

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      console.log(updatedCart)
    } catch {
      toast.error('Erro na adição do produto')
    }
  }

  const removeProduct = (productId: number) => {
    try {
      const verifyExistId = cart.find((product) => {
        return product.id === productId
      })

      if (!verifyExistId) {
        toast.error('Erro na remoção do produto')
        return
      }

      const updatedCart = cart.filter((product) => {
        return product.id !== productId
      })

      setCart(updatedCart)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na remoção do produto')
    }
  }

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedCart = cart.filter((product) => {
        return product.id !== productId
      })

      const upgradableProduct = cart.find((product) => {
        return product.id === productId
      })

      const stock = await api.get(`/stock/${productId}`).then((response) => {
        return response.data
      })

      if (!upgradableProduct) {
        return
      }

      if (amount <= 0) {
        return
      }

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const updatedProduct = {
        title: upgradableProduct.title,
        id: upgradableProduct.id,
        price: upgradableProduct.price,
        image: upgradableProduct.image,
        amount: amount,
      }

      updatedCart.push(updatedProduct)

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextData {
  const context = useContext(CartContext)

  return context
}
