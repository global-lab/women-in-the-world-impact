function create_json() {
    let data_path = 'templates/resources/data.csv';
    d3.csv(data_path).then(function (data) {
        let cat_arr = d3.nest()
            .key(function (d) {
                return d.Category;
            })
            .entries(data);
        console.log('cat arr', cat_arr);

        // let subcat_arr = d3.nest()
        //     .key(function(d) {
        //         return d.Sub_Category
        //     })
        //     .entries(cat_arr);
        // console.log('subcat arr', subcat_arr);

        let data_reorg = {
            'name': 'Women in the World Projects',
            'children': []
        };

        //first set of children - category
        for (let org of cat_arr) {
            let cat_dict = {};
            cat_dict.name = org.key;
            cat_dict.children = [];
            data_reorg.children.push(cat_dict)
        }

        //second set of children - sub category
        for (let org of cat_arr) {
            let subcat_arr = [... new Set(org.values.map(x => x.Sub_Category))]
            for (let subcat_name of subcat_arr) {
                let subcat_dict = {};
                subcat_dict.name = subcat_name;
                subcat_dict.children = [];
                let this_nest = data_reorg.children[get_index(org.key, cat_arr)]
                this_nest.children.push(subcat_dict)
            }
        }

        //third set of children - title of project, date, location, impact, link, advisors, initials
        // let cur_child_dict = data_reorg.
        for (let i = 0; i < data_reorg.children.length; i++) { //first set of children
            console.log(data_reorg.children[i])
            let cat = data_reorg.children[i].name; //name of category
            for (let j = 0; j < data_reorg.children[i].children.length; j++) {
                let subcat = data_reorg.children[i].children[j].name; //name of subcategory
                let children_arr = data_reorg.children[i].children[j].children; //will push to this
                // temp_dict.name = data.

                //need to find element in data or cat arr that has the same cat and subcat
                //get its info
                for (let datapoint of data) {
                    if (datapoint.Category === cat && datapoint.Sub_Category === subcat) {
                        temp_dict = {}
                        temp_dict.name = datapoint.Title;
                        temp_dict.data = datapoint;
                        children_arr.push(temp_dict)
                    }
                }
            }
        }
        document.getElementsByTagName('body')[0].innerHTML = "<p>" + JSON.stringify(data_reorg) + "</p>"
        console.log('data reorg', data_reorg);
        console.log('data', data);

        // for (let data_el of data) {
        //
        // }
    });
}