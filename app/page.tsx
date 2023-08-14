import Gauge from "./Gauge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Gauge value={45} segments={5} color="stroke-blue-600" />
      <Gauge value={10} segments={3} color="stroke-yellow-600" />
      <Gauge value={100} segments={7} color="stroke-orange-600" />
      <Gauge value={70} segments={7} color="stroke-green-600" />
    </main>
  );
}
