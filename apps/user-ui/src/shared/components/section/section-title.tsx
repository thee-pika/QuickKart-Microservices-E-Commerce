import React from 'react'

const SectionTitle = ({title}: {title: string}) => {
  return (
    <div>
      <h1 className='mt-8 ml-8 font-serif font-bold text-3xl text-gray-700 '>{title}</h1>
    </div>
  )
}

export default SectionTitle;
