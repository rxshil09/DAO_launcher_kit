import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='grid grid-cols-12'>
        <div className='col-span-12 sm:col-span-5 bg-green-600'>
          child 1
        </div>
        <div className='col-span-12 sm:col-span-5 bg-red-600'>
          child 2
        </div>
        <div className='col-span-12 sm:col-span-2 bg-blue-600'>
          child 3
        </div>
      </div>
    </>
  )
}

export default App
