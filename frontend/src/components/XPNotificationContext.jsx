import React, { createContext, useState } from 'react'

export const XPContext = createContext({})

export const XPProvider = ({ children }) => {
  const [xp, setXp] = useState(0)
  return (
    <XPContext.Provider value={{ xp, setXp }}>
      {children}
    </XPContext.Provider>
  )
}

export default XPProvider
