// https://observablehq.com/@d3/force-directed-tree@183
// add text to html
// function _1(md) {
//   return md`
// # Force-Directed Tree

// A [force-directed layout](/@d3/force-directed-graph) of a tree using [_hierarchy_.links](https://github.com/d3/d3-hierarchy/blob/master/README.md#node_links).
//   `;
// }

// the function wich draw the chart pats , this is important because it draw the svg with all the elements
function _chart(d3, data, width, height, drag, invalidation) {
  // use the data by d3, hte root conatins all the data, the nodes and the childrens in a recursion tree
  const root = d3.hierarchy(data);
  // console.log('this is the root ', root);
  // create links from d3 : oobject containing the source and the target and bunch of data in a recursion manner
  const links = root.links();
  // create nodes from d3 with each children and their children in a recursion manner and add to each node some data related to d3.js such as the childrens , data , depth , height , index and the parent node if exists.
  const nodes = root.descendants();
  // console.log('this is the nodes', nodes);

  // define how a node will behave when dragged
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(20)
        // well separate and visualise the lines
        .strength(1)
    )
    // strength define how long the line of the link is
    .force('charge', d3.forceManyBody().strength(-500))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  // draw the svg using s3 and define the width and height
  const svg = d3
    .create('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height]);

  // define the style of the links
  const link = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.9)
    .selectAll('line')
    .data(links)
    .join('line');

  // define the shape and style of the  nodes
  const node = svg
    // this is the parent nodes : all are the same except the last children nodes
    .append('g')
    .attr('fill', 'green')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .selectAll('circle')
    // this is the last children nodes of all nodes : draw them in red circles
    .data(nodes)
    .join('circle')
    .attr('fill', (d) => (d.children ? null : 'red'))
    .attr('stroke', (d) => (d.children ? null : '#fff'))
    // define the radius of all the nodes
    .attr('r', 7.5)
    // apply the simulation when the node is dragged
    // this is the animation when dragging a node with the mouse
    .call(drag(simulation));

  // this the tooltip
  node.append('title').text((d) => `${d.data.name} `);

  // do the animation when drag : define the behavior of the simulation: this is the dragging animation
  simulation.on('tick', () => {
    // update the position of the link
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
    // update the position of the node
    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  });
  // this is one of the params passed to the chart function
  invalidation.then(() => simulation.stop());

  return svg.node();
}

// return the data as an object  in a nested arrays of childrens: convert the data from json to a js object
function _data(FileAttachment) {
  const thisdata = FileAttachment('flare-2.json').json();
  // console.log(thisdata.then((data) => console.log(data)));
  return thisdata;
  // return the data as a javascript object
}

// return the height of the graph
function _height() {
  return 600;
}

// define the drag behavioe when dragging a node  in the graoh
function _drag(d3) {
  // return a function witch will be applied to the nodes of the graph , this function has all the phases when dragging a node and yodate the position of the node during these phases
  return (simulation) => {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // define the behavior of the drag in d3
    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };
}

// require the d3 modyule
function _d3(require) {
  return require('d3@6');
}

// define function with all the params used with the runtime module in the html file to draw the chart
export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  // get the data from the file and make it as json in flare2-json
  const fileAttachments = new Map([
    [
      'flare-2.json',
      {
        url: new URL(
          './files/e65374209781891f37dea1e7a6e1c5e020a3009b8aedf113b4c80942018887a1176ad4945cf14444603ff91d3da371b3b0d72419fa8d2ee0f6e815732475d5de',
          import.meta.url
        ),
        mimeType: null,
        toString,
      },
    ],
  ]);

  // console.log('the file attachments', fileAttachments);
  main.builtin(
    'FileAttachment',
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  // main.variable(observer()).define(['md'], _1);

  // draw the chart using the _chart private function
  // we will define the pramas after the use of the _chart
  main.variable(observer('chart')).define(
    'chart',
    //  ass the params to the chart function
    ['d3', 'data', 'width', 'height', 'drag', 'invalidation'],
    // draw the chart in the main (body) using the previously defined params
    _chart
  );
  // defining the passed params to _chart private function

  // get tje data param from the file
  main.variable(observer('data')).define('data', ['FileAttachment'], _data);
  // get the height from the height private function
  main.variable(observer('height')).define('height', _height);
  // get the drag param from the _drag private function
  main.variable(observer('drag')).define('drag', ['d3'], _drag);
  // get the d3 module from the _d3 private function
  main.variable(observer('d3')).define('d3', ['require'], _d3);
  // return the main witch contains the chart to combine it with the runtime module and draw it in the browser
  return main;
}
