const url = "data/samples.json";

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

    

    // check the testSubjects array
    console.log(testSubjects);

    function updateMetadataPanel(subject) {
        console.log("updateMetadataPanel");

        var metaPanel = d3.select("#sample-metadata");
        metaPanel.selectAll("p").remove();
        Object.entries(subject.metadata).forEach(([key, value])=>{
            metaPanel.append("p").text(`${key}: ${value}`);
        });
     }

     // return top 10 samples of a test subject
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


    // update the horizontal bar chart
    function updateBarChart(subject) {
        console.log("updateBarChart()");

        var sampleArray = getSamplesArray(subject);
        sampleArray.sort((a,b) => b - a);
        console.log(sampleArray);

        var top10 = sampleArray.slice(0, 10);
        top10.reverse();

        console.log(top10);

        var top10_otu_ids = top10.map(sample=>`OTU ${sample.otu_id}`);
        var top10_sample_values = top10.map(sample=>sample.sample_value);
        var top10_otu_labels = top10.map(sample=>sample.otu_label);

        console.log(top10_otu_ids);
        console.log(top10_sample_values);
        console.log(top10_otu_labels);

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
            xaxies: "OTU ID"
        };

        Plotly.newPlot('bubble', data, layout);
    }

    function updateGauge(subject) {
        console.log("updateGauge()");

        var data = [
            {
              type: "indicator",
              mode: "gauge+number",
              value: subject.metadata.wfreq,
              title: { text: "Belly Button Washing Frequency", font: { size: 24 } },
              gauge: {
                axis: { 
                    range: [0, 9], 
                    
                    tickwidth: 1, 
                    tickcolor: "darkblue",
                    nticks: 10 
                    // tickmode: "array",
                    // tickvals: [0,1,2,3,4,5,6,7,8,9],
                    // ticktext: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9'],
                    // ticks: "outisde",
                    // tickangle: 0,
                    // showticklabels: true,
                    // tickprefix: "xxxxx"
                    
                },
                bar: { color: "purple" },
                bgcolor: "white",
                borderwidth: 4,
                bordercolor: "gray",
                steps: [
                  { range: [0, 1], color: "white" },
                  { range: [1, 2], color: "white" },
                  { range: [2, 3], color: "yellow" },
                  { range: [3, 4], color: "yellow" },
                  { range: [4, 5], color: "orange" },
                  { range: [5, 6], color: "orange" },
                  { range: [6, 7], color: "green" },
                  { range: [7, 8], color: "green" },
                  { range: [8, 9], color: "blue" },
                  { range: [9, 10], color: "blue" }

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

    // get the selected subject and update all 
    function updateCharts() {
        console.log("in updateCharts()");

        var menu = d3.select("#selDataset");
        var name = menu.property("value");
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


    // populate the Test Subject ID drop down list
    var dropdownMenu = d3.select("#selDataset");
    dropdownMenu.on("change", updateCharts);
    dropdownMenu.selectAll("option").remove();
    names.forEach(function(name){
        var option = dropdownMenu.append("option").text(name);
        option.attr("value", name);
    });

    // show initial charts
    updateCharts();
});
