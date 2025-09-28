import { PacmanLoader } from "react-spinners";
import React from 'react'

const MainLoader = ({ isLoading }: {
    isLoading: boolean
}) => {
    return (
        <div className="flex items-center justify-center min-h-screen ">
            <PacmanLoader
                color={"#b26aed"}
                loading={isLoading}
                size={20}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    )
}

export default MainLoader;

