export function Button({children, onClick}: Readonly<{children: string; onClick: ()=> void}>){
    return (
        <button
            onClick ={onClick}
            className="fixed bottom-8 right-8 bg-blue-500 flex justify-center items-center text-white text-3xl rounded-full w-14 h-14 shadow-lg hover:bg-blue-600 active:scale-95 transition-transform">
            {children}
            </button>
    )
}