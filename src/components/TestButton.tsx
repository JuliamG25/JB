export default function TestButton() {
  return (
    <div className="p-4">
      <button className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
        Test Button React
      </button>
      <p className="text-gray-500 font-bold mt-4">Si este botón tiene gradiente, Tailwind funciona en React</p>
    </div>
  );
}

