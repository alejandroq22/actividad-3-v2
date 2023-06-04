
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencia a los elementos del DOM
    const indicatorSelect = document.getElementById('indicator-select');
    const indicatorInfo = document.getElementById('indicator-info');
    const indicatorChart = document.getElementById('indicator-chart-canvas');
  
    // Definir los indicadores deseados
    const desiredIndicators = ['dolar', 'euro', 'utm', 'uf'];
  
    // Cargar los tipos de indicadores desde la API
    axios.get('https://mindicador.cl/api')
      .then(function(response) {
        const indicators = response.data;
        // Filtrar los indicadores deseados
        const filteredIndicators = indicators.filter(function(indicator) {
          return desiredIndicators.includes(indicator.codigo);
        });
        // Agregar opciones al selector de indicadores
        filteredIndicators.forEach(function(indicator) {
          const option = document.createElement('option');
          option.value = indicator.codigo;
          option.textContent = indicator.nombre;
          indicatorSelect.appendChild(option);
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  
    // Variable para almacenar la instancia del gráfico
    let myChart;
  
    // Función para actualizar el gráfico
    function updateChart(labels, values) {
      if (myChart) {
        myChart.destroy();
      }
  
      // Crear el gráfico utilizando Chart.js
      myChart = new Chart(indicatorChart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Indicador',
            data: values,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Fecha'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Valor'
              }
            }
          }
        }
      });
    }
  
    // Manejar el evento de cambio de selección del indicador
    indicatorSelect.addEventListener('change', function() {
      const selectedIndicator = indicatorSelect.value;
      if (selectedIndicator) {
        // Obtener información del indicador seleccionado desde la API
        axios.get(`https://mindicador.cl/api/${selectedIndicator}`)
          .then(function(response) {
            const indicatorData = response.data;
            // Construir la información del indicador
            let html = `
              <h3>${indicatorData.nombre}</h3>
              <p><strong>Valor:</strong> ${indicatorData.serie[0].valor}</p>
              <p><strong>Unidad de medida:</strong> ${indicatorData.unidad_medida}</p>
              <p><strong>Fecha:</strong> ${indicatorData.serie[0].fecha}</p>
            `;
            indicatorInfo.innerHTML = html;
  
            // Obtener los valores del indicador para el último año
            const values = indicatorData.serie.map(function(data) {
              return data.valor;
            });
            const labels = indicatorData.serie.map(function(data) {
                return moment(data.fecha).format('DD/MM/YYYY');
              });
  
            // Actualizar el gráfico
            updateChart(labels, values);
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        indicatorInfo.innerHTML = '';
        indicatorChart.innerHTML = '';
      }
    });
  });