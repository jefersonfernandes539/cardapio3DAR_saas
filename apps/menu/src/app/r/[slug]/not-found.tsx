export default function RestaurantNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-bold">Cardápio não encontrado</h1>
      <p className="text-gray-600">Confira o QR code da mesa e tente novamente.</p>
    </main>
  );
}
