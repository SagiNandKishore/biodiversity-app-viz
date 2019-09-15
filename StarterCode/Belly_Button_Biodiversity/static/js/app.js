function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    sample_metadata_url = "/metadata/"+sample
    var sample_metadata_div = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    sample_metadata_div.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    d3.json(sample_metadata_url).then(function(metadata){
      Object.entries(metadata).forEach(([key, value]) => {
        sample_metadata_div.append("p").text(`${key} : ${value}`);
            });

    // BONUS: Build the Gauge Chart
    buildGauge(metadata.WFREQ);
      });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  // @TODO: Build a Bubble Chart using the sample data
  //https://plot.ly/javascript/bubble-charts/#marker-size-color-and-symbol-as-an-array
    sample_details_url = "/samples/"+sample
    d3.json(sample_details_url).then(function(data){
        //console.log(data)
        var otu_ids = data.otu_ids;
        var otu_labels = data.otu_labels;
        var sample_values = data.sample_values;

        var trace1 ={
          x:otu_ids,
          y:sample_values,
          text:otu_labels,
          mode:'markers',
            marker: {
              size : sample_values,
              color: otu_ids
            }
        }
        //https://plot.ly/javascript/figure-labels/
        var layout1 = {
          title: `Microbial Distribution Chart for Sample ${sample}`,
          showlegend: false,
          xaxis:{
            title:`OTU_IDs`
          },
          yaxis:{
            title:`Sample Value`
          }
        }
        var data = trace1;
        
        Plotly.newPlot("bubble", [trace1], layout1);    
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

    // We only need 10 elements to be populated in slice but if the
    // need changes to 11 values, we would just need to change the
    // below constants. The data is already sorted in the Flask app
    // so no need for sorting the data again in JS.

    //Use sample_values as the values for the PIE chart.
    //Use otu_ids as the labels for the pie chart.
    //Use otu_labels as the hovertext for the chart.

    var num_elements = 10;
    var start_position = 0;
    var end_position = start_position + num_elements;
    
    // Build a Pie chart
    var otu_ids_sliced = otu_ids.slice(start_position, end_position);
    var sample_values_sliced = sample_values.slice(start_position, end_position);
    var otu_labels_sliced = otu_labels.slice(start_position, end_position);

    var data = [{
      values: sample_values_sliced,
      labels: otu_ids_sliced,
      hovertext: otu_labels_sliced,
      type: 'pie'
    }];

    layout2={
      showlegend: true,
      title:`Top 10 Microbial Analysis on Sample ${sample}`
    };
    Plotly.newPlot("pie", data, layout2)
    //console.log(otu_ids_sliced);
    
  });

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function buildGauge(frequency)
{
  //console.log(frequency);
  var data = [{
    domain:{
      x:[0, 1,2,3],
      y:[0,1,2,3]},
      value: frequency,
      type: "indicator",
      mode:"gauge+number",
      text:["0-1", "1-2", "3-4", "5-6", "7-8", "8-9"]
  }];

  layout= {
    title:`<b>Belly Button Washing Frequency</b> <br> Scrubs Per Week`
  }

  Plotly.newPlot("gauge", data, layout)
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
