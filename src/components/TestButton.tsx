export default function TestButton() {
  return (
    <div className="p-4">
      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
        Test Button React
      </button>
      <p className="text-red-500 font-bold mt-4">Si este botón tiene gradiente, Tailwind funciona en React</p>
    </div>
  );
}

