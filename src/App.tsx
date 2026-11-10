import Card from "./Card";

function App() {
  return (
    <div className="container">
      <Card
        title="Card 1"
        description="Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste "
        tag="Novo"
        buttonText="Ver mais"
        onButtonClick={() => alert("Clicou!")}
      />
      <Card title="Card 2" 
      description="Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste" />
      
      <Card title="Card 3" 
      description="Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste" />
    
    </div>
  );
}

export default App;