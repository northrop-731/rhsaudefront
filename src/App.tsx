import Card from "./Card";

function App() {
  return (
    <div className="container">
      <Card
        title="Card 1"
        description="Primeira descrição."
        tag="Novo"
        buttonText="Ver mais"
        onButtonClick={() => alert("Clicou!")}
      />
      <Card title="Card 2" description="Segunda descrição." />
    </div>
  );
}

export default App;