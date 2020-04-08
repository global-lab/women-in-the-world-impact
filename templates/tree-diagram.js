let toggleval = "init"
const margin = ({
    top: 0,
    right: 40 * (window.innerWidth / 100),
    bottom: 0,
    // left: (window.innerWidth - (40 * (window.innerWidth / 100))) / 2
    left: 10 * (window.innerWidth / 100),
});

function graph() {
    let json_path = 'templates/resources/data_no_titles.json';
    let other_json_path = 'templates/resources/data.json'
    d3.json(other_json_path).then(function (other_data) {
        function gen_title_list() {
            for (let cat_dict of Object.values(other_data.children)) {
                for (let child_dict of cat_dict.children) {
                    let total_text = [];
                    for (let title of child_dict.children) {
                        total_text.push([title.name, "Goal: " + title.data.Goal, title.data.Date, title.data.Location, title.data.Link])
                    }
                    blurbs[child_dict.name] = total_text;
                }
            }
            console.log(blurbs)
        }

        gen_title_list();

        d3.json(json_path).then(function (data) {
            console.log(data);

            const width = window.innerWidth - margin.right;
            const height = window.innerHeight;

            const dx = width / 10;
            const dy = height / 6;
            const root = d3.hierarchy(data);

            let tree = d3.tree().nodeSize([dx, dy]);
            let diagonal = d3.linkVertical().x(d => d.x).y(d => d.y);

            root.x0 = dy / 2;
            root.y0 = 0;
            root.descendants().forEach((d, i) => {
                d.id = i;
                d._children = d.children;
                d.fill = colors[d.data.name];
                if (d.fill === undefined && d.parent !== null) {
                    d.fill = colors[d.parent.data.name]
                }
                if (d.depth && d.data.name.length !== 7) d.children = null;
            });

            const svg = d3.select("#viz")
                .append('svg')
                .attr('id', "tree")
                .attr('width', width)
                .attr('height', height)
                .attr('x', margin.left)
                .attr('y', margin.top)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("font", "18px Microsoft Tai Le")
                .style("user-select", "none");
            // .attr('transform', `translate(${},${-height/4})`)


            const gLink = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "#9f9f9f")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 2.5);

            const gNode = svg.append("g")
                .attr("cursor", "pointer")
                .attr("pointer-events", "all");

            function update(source, duration = d3.event && d3.event.altKey ? 2500 : 250) {
                const nodes = root.descendants().reverse();
                const links = root.links();

                // Compute the new tree layout.
                tree(root);

                let left = root;
                let right = root;
                root.eachBefore(node => {
                    if (node.x < left.x) left = node;
                    if (node.x > right.x) right = node;
                });

                // const height = right.x - left.x + margin.top + margin.bottom;

                const transition = svg.transition()
                    .duration(duration)
                    .attr("viewBox", [-width / 2, -height / 2.5, width, height])
                    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

                // Update the nodes…
                const node = gNode.selectAll("g")
                    .data(nodes, d => d.id)
                    .attr("class", d => gen_class(d.data.name));

                // Enter any new nodes at the parent's previous position.
                const nodeEnter = node.enter().append("g")
                    .attr("transform", d => `translate(${source.x0},${source.y0})`)
                    .attr("fill", d => d.fill)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1)
                    .attr("class", d => gen_class(d.data.name))
                    .on("click", d => {
                        d.children = d.children ? null : d._children;
                        // console.log('here', d)
                        document.getElementById('content').innerHTML = "";
                        let i = 0;
                        if (blurbs[d.data.name] !== undefined) {
                            for (let e of blurbs[d.data.name]) {
                                gen_sidebar_elements(e[0], e[1], e[2], e[3], e[4], d.fill, i += 1)
                            }
                        }
                        update(d);
                    });

                let r = 5;
                nodeEnter.append("circle")
                    .attr("r", r)
                    .attr("fill", d => d.fill)
                    .attr("stroke-width", 10)
                    .attr("class", d => gen_class(d.data.name));


                nodeEnter.append("text")
                    .attr("dy", "0.31em")
                    .attr("x", d => d._children ? -(r + 2) : (r + 2))
                    .attr("class", d => gen_class(d.data.name))
                    .attr("text-anchor", d => d._children ? "end" : "start")
                    .text(d => d.data.name)
                    .clone(true).lower()
                    .attr("stroke-linejoin", "round")
                    .attr("fill", d => d.fill)
                    .attr("stroke-width", 0.4)
                    .attr("stroke", d => d.fill);

                d3.selectAll('text')
                    .attr('transform', 'rotate(30)')
                    .attr('font-size', '1.2em');


                // Transition nodes to their new position.
                const nodeUpdate = node.merge(nodeEnter).transition(transition)
                    .attr("transform", d => `translate(${d.x},${d.y})`)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                const nodeExit = node.exit().transition(transition).remove()
                    .attr("transform", d => `translate(${source.x},${source.y})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);

                // Update the links…
                const link = gLink.selectAll("path")
                    .data(links, d => d.target.id);

                // Enter any new links at the parent's previous position.
                const linkEnter = link.enter().append("path")
                    .attr("d", d => {
                        const o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                    });

                // Transition links to their new position.
                link.merge(linkEnter).transition(transition)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition(transition).remove()
                    .attr("d", d => {
                        const o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    });

                // Stash the old positions for transition.
                root.eachBefore(d => {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            document.getElementById('togglepanzoom').addEventListener('click', d => {
                console.log('toggleval', toggleval)
                if (toggleval === 'on' || toggleval === "init") {
                    svg.call(d3.zoom().on("zoom", function () {
                        d3.selectAll('g')
                            .attr("transform", d3.event.transform);
                        update(root, 0)
                    }));
                    toggleval = "off";
                } else {
                    svg.on("zoom", null);
                    toggleval = "on";
                }
            });

            update(root);
            return svg.node();
        })
    })
}

function add_pan_zoom() {
    d3.select("#tree")
}

//
function gen_class(d) {
    d = d.split(" ").join("");
    d = d.split("t/F").join("");
    d = d.split("n/F").join("");
    d = d.split("s/F").join("");
    d = d.split("&").join("");
    d = d.split("'").join("");
    if (d === "") {
        d = "sample"
    }

    return d
}

function get_index(category, cat_arr) {
    for (let i = 0; i < cat_arr.length; i++) {
        if (cat_arr[i].key === category) {
            return i
        }
    }
}

// let counter = 0;
function gen_sidebar_elements(title_text, blurb_text, date, location, link, fill, counter) {

    // let background_color = 'rgba(255,255,255,0.5)';
    let background_color = 'rgba(0,0,0,0.3)';
    let link_color = "#b5b5b5"


    //creating div that will contain all accordion card content
    let content_container = document.createElement("DIV");
    content_container.classList.add('card');
    content_container.style.outline = '#2f2f2f'
    content_container.style.backgroundColor = background_color;

    //making accordion card blurb (the expandable part)
    let blurb_div = document.createElement('DIV');
    blurb_div.classList.add('collapse')
    blurb_div.id = 'collapse' + counter;
    blurb_div.setAttribute('aria-labelledby', 'heading' + counter);
    blurb_div.setAttribute('data-parent', '#content');


    blurb_div.style.backgroundColor = background_color;


    let blurb_body = document.createElement('DIV');
    blurb_body.classList.add('card-body');
    blurb_body.classList.add('text-light');
    blurb_body.classList.add('pb-4');
    blurb_body.classList.add('h-100');
    // blurb_div.classList.add('my-auto');
    // blurb_div.classList.add('align-items-center');
    blurb_body.innerHTML = blurb_text + "<br/>";

    console.log('link', link)
    if (link !== undefined) {
        let a = document.createElement("a");
        a.setAttribute('href', link);
        a.setAttribute('target', '_blank');
        a.style.color = link_color;
        a.classList.add('float-right');
        a.innerHTML = '<p style="font-size: 0.9em; color=' + link_color + '; margin-bottom: 0.5em">Link to paper</p>';
        blurb_body.appendChild(a)
    }

    //making accordion card header
    let title_div = document.createElement("DIV");
    title_div.classList.add('card-header');
    title_div.classList.add('m-0');
    title_div.id = 'heading' + counter;


    let title_button = document.createElement('button');
    title_button.type = 'button';
    title_button.classList.add('btn');
    title_button.classList.add('btn-light');
    title_button.classList.add('btn-block');
    title_button.classList.add('text-left');
    title_button.classList.add('text-light');
    title_button.classList.add('m-0');

    title_button.setAttribute('data-toggle', 'collapse');
    title_button.setAttribute('href', '#collapse' + counter);
    title_button.setAttribute('data-target', '#collapse' + counter);
    title_button.setAttribute('aria-controls', 'collapse' + counter);
    title_button.style.fontSize = '1.1em';
    title_button.style.fontWeight = '600';
    title_button.style.backgroundColor = 'rgba(0,0,0,0)';

    // console.log('date', date, 'location', location)

    title_button.innerHTML = title_text + '<br/>';
    if (date !== undefined && location !== undefined) {
        let small_text = document.createElement('SMALL');
        // small_text.classList.add('text-muted');
        small_text.style.color = link_color;
        small_text.classList.add('float-right');
        small_text.innerHTML = location + " | " + date;
        title_button.appendChild(small_text)

    }

    blurb_div.appendChild(blurb_body);
    title_div.appendChild(title_button);
    content_container.appendChild(title_div);
    content_container.appendChild(blurb_div);
    document.getElementById('content').appendChild(content_container);

    if (Object.keys(colors).includes(title_text)) {
        blurb_div.classList.add('show')
        title_button.classList.add('text-center')
    }

    // counter += 1;
    return content_container
}

