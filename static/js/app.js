const url = "data/samples.json";

/* read json file with anonymous call back function;
 * construct testSubjects array;
 * display initial charts;
 */
d3.json(url).then(function(data){
    // display all data
    console.log(data);

    var testSubjects = [];

    var metadata = data.metadata;
    var names = data.names;
    var samples = data.samples;

    // fill testSubjects array for later used
    names.forEach(function(name, index){
        var person = {};
        person['name'] = name;
        person['metadata'] = metadata[index];
        person['samples'] = samples[index];
        testSubjects.push(person);
    });

    // populate the Test Subject ID drop down list
    var dropdownMenu = d3.select("#selDataset");
    dropdownMenu.on("change", updateAll);
    dropdownMenu.selectAll("option").remove();
    names.forEach(function(name){
        var option = dropdownMenu.append("option").text(name);
        option.attr("value", name);
    });

    // show initial charts
    updateAll();

    // get the selected subject and update all components
    function updateAll() {
        console.log("in updateAll()");

        var name = d3.select("#selDataset").property("value");
        var selectedSubject = {};

        for(i=0; i < testSubjects.length; i++){
            if(testSubjects[i].name == name) {
                selectedSubject = testSubjects[i];
                break;
            }
        }

        console.log(selectedSubject);

        // update individual components
        updateMetadataPanel(selectedSubject);
        updateBarChart(selectedSubject);
        updateBubbleChart(selectedSubject);
        updateGauge(selectedSubject);
    }
});


/**
 * update the Metadata Demographic Info panel
 * @param {Object} subject - Test Subject
 * @param {integer} subject.name - Test Subject's id
 * @param {Object} subject.metadata - Test Subject's metadata
 * @param {Object} subject.samples - Test Subject's samples 
 */
function updateMetadataPanel(subject) {
    console.log("updateMetadataPanel");

    var metaPanel = d3.select("#sample-metadata");
    metaPanel.selectAll("p").remove();
    Object.entries(subject.metadata).forEach(([key, value])=>{
        metaPanel.append("p").text(`${key}: ${value}`);
    });
}

/**
 * helper function to return an array of test Subjects with their sample data
 * @param {Object} subject 
 */
function getSamplesArray(subject) {
    var otu_ids = subject.samples.otu_ids;
    var sample_values = subject.samples.sample_values;
    var otu_labels = subject.samples.otu_labels;
    var sampleArray = []
    
    otu_ids.forEach(function(id, index){
        var item = {};
        item['otu_id'] = id;
        item['sample_value'] = sample_values[index];
        item['otu_label'] = otu_labels[index];
        sampleArray.push(item);
    });

    return sampleArray;
}

/**
 * update the Horizontal bar chart
 * @param {Object} subject 
 */
function updateBarChart(subject) {
    console.log("updateBarChart()");

    var sampleArray = getSamplesArray(subject);
    sampleArray.sort((a,b) => b.sample_value - a.sample_value);

    var top10 = sampleArray.slice(0, 10);
    top10.reverse();

    var top10_otu_ids = top10.map(sample=>`OTU ${sample.otu_id}`);
    var top10_sample_values = top10.map(sample=>sample.sample_value);
    var top10_otu_labels = top10.map(sample=>sample.otu_label);

    var trace = {
        x: top10_sample_values,
        y: top10_otu_ids,
        text: top10_otu_labels,
        type: "bar",
        orientation: "h"
    };

    var data = [trace];

    var layout = {
        margin: {
            l: 100,
            r: 100,
            t: 0,
            b: 25
        }
    };

    // Plotly.newPlot("bar", data, layout, {staticPlot: true});
    Plotly.newPlot("bar", data, layout, {displayModeBar: false});        

}


/**
 * update the BubbleChart
 * @param {Object} subject 
 */
function updateBubbleChart(subject) {
    console.log("updateBubbleChart()");

    var sampleArray = getSamplesArray(subject);
    var otu_ids = sampleArray.map(sample=>sample.otu_id);
    var sample_values = sampleArray.map(sample=>sample.sample_value);
    var otu_labels = sampleArray.map(sample=>sample.otu_label);   

    var colors = [];
    var opacities = [];
    for(i=0;i<sampleArray.length;i++){
        var num1 = Math.floor(Math.random() * 256);
        var num2 = Math.floor(Math.random() * 256);
        var num3 = Math.floor(Math.random() * 256);
        var color = `rgb(${num1}, ${num2}, ${num3})`;
        colors.push(color);

        var opacity = Math.random();
        opacities.push(opacity);
    }

    var trace1 = {
        x: otu_ids,
        y: sample_values,
        mode: 'markers',
        marker: {
            color: colors,
            opacity: opacities,
            size: sample_values,
            sizemode: 'area',
            sizeref: 0.03,
        },
        text: otu_labels
    }

    var data = [trace1];

    var layout = {
        showlegend: false,
        xaxis: {title:"OTU ID"}
    };

    Plotly.newPlot('bubble', data, layout);
}

/**
 * update the Gauge Chart
 * @param {Object} subject 
 */
function updateGauge(subject) {
    console.log("updateGauge()");

    var data = [
        {
          type: "indicator",
          mode: "gauge+number",
          value: subject.metadata.wfreq,
          title: { text: "Belly Button Washing Frequency", font: { size: 24 } },
          subtitle: { text: "Scrubs per Week", font: { size: 18 } },
          gauge: {
            axis: { 
                range: [0, 9], 
                
                tickwidth: 1, 
                tickcolor: "darkblue",
                nticks: 10 
            },
            bar: { color: "purple" },
            bgcolor: "white",
            borderwidth: 4,
            bordercolor: "gray",
            steps: [
              { range: [0, 1], color: 'rgb(255, 255, 255)'},
              { range: [1, 2], color: "rgb(225, 255, 225)" },
              { range: [2, 3], color: "rgb(195, 255, 195)" },
              { range: [3, 4], color: "rgb(165, 255, 165)" },
              { range: [4, 5], color: "rgb(135, 255, 135)" },
              { range: [5, 6], color: "rgb(105, 255, 105)" },
              { range: [6, 7], color: "rgb(75, 255, 75)" },
              { range: [7, 8], color: "rgb(45, 255, 45)" },
              { range: [8, 9], color: "rgb(0, 255, 0)" },
            ],
            threshold: {
              line: { color: "red", width: 4 },
              thickness: 0.75,
              value: 3
            }
          }
        }
      ];
      
    var layout = {
        margin: { t: 25, r: 25, l: 25, b: 25 },
        paper_bgcolor: "lavender",
        font: { color: "darkblue", family: "Arial" }
     };
      
    Plotly.newPlot('gauge', data, layout);       

}