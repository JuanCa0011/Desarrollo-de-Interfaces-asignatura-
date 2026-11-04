import './ExploreContainer.css';

const ExploreContainer: React.FC = () => {
  return (
    <div id="container">
      <img className="explore-image" src="/assets/delorean.webp" alt="DeLorean" />

      {/* Tabla de 3 filas x 2 columnas */}
      <table className="explore-table">
        <tbody>
          <tr>
            <th scope="row">Framework</th>
            <td>React</td>
          </tr>
          <tr>
            <th scope="row">Librería UI</th>
            <td>Ionic</td>
          </tr>
          <tr>
            <th scope="row">Lenguaje</th>
            <td>TypeScript</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ExploreContainer;
