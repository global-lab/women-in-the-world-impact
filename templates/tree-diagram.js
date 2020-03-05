let colors = {
    'Business': "#570809",
    'Education': "#5e3a53",
    'Cultural': "#3c4d85",
    'Health': '#927417',
    'Other': "#783b16"
}

let blurbs = {
    'Education': "<ul>" +
        "<li>30+ projects</li>" +
        "<li>Introduce more women and girls to STEM through clubs, STEM camps, and understanding of technology</li>" +
        "<li>Assess the presence of gendered career interests in Worcester schools</li>" +
        "<li>Evaluate the culture and support surrounding women at WPI</li></ul>",
    'Cultural': "No information about this yet",
    'Business': "<ul>" +
        "<li>15+ projects</li>" +
        "<li>Projects support marginalized women to start local businesses</li>" +
        "<li>Help existing businesses expand and grow</li>" +
        "<li>Aid in marketing women’s products and organizations</li>" +
        "<li> Use technology to expand women’s businesses</li>" +
        "<li>Analyze factors affecting employment of women</li>" +
        "</ul>",
    'Health': "<ul>" +
        "<li>20+ projects</li>" +
        "<li>Increase awareness of women’s health issues within disadvantaged communities</li>" +
        "<li>Aid organizations that help women with cancer</li>" +
        "<li>Develop programs to prevent abuse of women</li>" +
        "<li>Research reproductive health issues</li>" +
        "<li> Study perceptions of health risks resulting from making weight in rowing</li>" +
        "<li>Aid in fundraising for homeless women</li>",
    'Other': "Projects that did not fit one particular category"
};


window.onload = function () {
    graph()
    // create_json()
};

function graph() {
    let json_path = 'templates/resources/data_no_titles.json';
    let other_json_path = 'templates/resources/data.json'
    d3.json(other_json_path).then(function (other_data) {
        function gen_title_list() {
            for (let cat_dict of Object.values(other_data.children)) {
                // if (cat_dict.name === cat) {
                for (let child_dict of cat_dict.children) {
                    console.log(child_dict.name);
                    // if (child_dict.name === subcat) {
                    let total_text = "<ul>";
                    for (let title of child_dict.children) {
                        console.log('title', title)
                        total_text += "<li>" + title.name + "</li>"
                    }
                    total_text += "</ul>";
                    blurbs[child_dict.name] = total_text;

                }
            }
            console.log(blurbs)
        }

        gen_title_list()

        d3.json(json_path).then(function (data) {
            console.log(data)
            const margin = ({top: 10, right: 30 * (window.innerWidth / 100), bottom: 10, left: 300});
            const width = window.innerWidth - margin.right;
            const height = window.innerHeight;

            const dy = width / 6;
            const dx = height / 20;
            const root = d3.hierarchy(data);

            let tree = d3.tree().nodeSize([dx, dy])
            let diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

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
                .attr('width', width)
                .attr('height', height)
                .attr('x', margin.left)
                .attr('y', margin.top)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("font", "18px Microsoft Tai Le")
                .style("user-select", "none");

            const gLink = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "#9f9f9f")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 2.5);

            const gNode = svg.append("g")
                .attr("cursor", "pointer")
                .attr("pointer-events", "all");

            function update(source) {
                const duration = d3.event && d3.event.altKey ? 2500 : 250;
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

                const height = right.x - left.x + margin.top + margin.bottom;

                const transition = svg.transition()
                    .duration(duration)
                    .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

                // Update the nodes…
                const node = gNode.selectAll("g")
                    .data(nodes, d => d.id)
                    .attr("class", d => gen_class(d.data.name));

                // Enter any new nodes at the parent's previous position.
                const nodeEnter = node.enter().append("g")
                    .attr("transform", d => `translate(${source.y0},${source.x0})`)
                    .attr("fill", d => d.fill)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1)
                    .attr("class", d => gen_class(d.data.name))
                    .on("click", d => {
                        d.children = d.children ? null : d._children;
                        console.log('here', d)
                        document.getElementById("content").innerHTML = blurbs[d.data.name]
                        update(d);
                    });

                let r = 5
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
                    .attr("stroke", d => d.fill)


                // Transition nodes to their new position.
                const nodeUpdate = node.merge(nodeEnter).transition(transition)
                    .attr("transform", d => `translate(${d.y},${d.x})`)
                    .attr("fill-opacity", 1)
                    .attr("stroke-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                const nodeExit = node.exit().transition(transition).remove()
                    .attr("transform", d => `translate(${source.y},${source.x})`)
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

            update(root);
            // add_interactivity()
            return svg.node();
        })
    })
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

