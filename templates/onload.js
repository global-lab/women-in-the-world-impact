let colors = {
    'Projects Impacting Women': "#4a4a4a",
    'Business': "#3ec3bb",
    'Education': "#2d67ff",
    'Cultural': "#28a7ff",
    'Health': '#654eff',
    'Other': "#a71fdb"
};

let blurbs = {
    'Projects Impacting Women': [['Projects Impacting Women', 'WPI students have helped improve the lives of women' +
    ' and girls for over 20 years in 14 countries through 90+ Interactive Qualifying Projects (IQPs). ' +
    'This visualization aims to show the extent of fields in which our IQPs have made a difference for women']],
    'Education': [['Education', "<ul>" +
    "<li>30+ projects</li>" +
    "<li>Introduce more women and girls to STEM through clubs, STEM camps, and understanding of technology</li>" +
    "<li>Assess the presence of gendered career interests in Worcester schools</li>" +
    "<li>Evaluate the culture and support surrounding women at WPI</li></ul>"]],
    'Cultural': [['Cultural', "No information about this yet"]],
    'Business': [['Business', "<ul>" +
    "<li>15+ projects</li>" +
    "<li>Projects support marginalized women to start local businesses</li>" +
    "<li>Help existing businesses expand and grow</li>" +
    "<li>Aid in marketing women’s products and organizations</li>" +
    "<li> Use technology to expand women’s businesses</li>" +
    "<li>Analyze factors affecting employment of women</li>" +
    "</ul>"]],
    'Health': [['Health', "<ul>" +
    "<li>20+ projects</li>" +
    "<li>Increase awareness of women’s health issues within disadvantaged communities</li>" +
    "<li>Aid organizations that help women with cancer</li>" +
    "<li>Develop programs to prevent abuse of women</li>" +
    "<li>Research reproductive health issues</li>" +
    "<li> Study perceptions of health risks resulting from making weight in rowing</li>" +
    "<li>Aid in fundraising for homeless women</li></ul>"]],
    'Other': [['Other', "Projects that did not fit one particular category"]]
};


window.onload = function () {
    graph();
    resize_div()
};

function resize_div() {
    $("#resizable").resizable({
        handles: 'e, w'
    });
    $("#resizable").resize(function(){
        margin.right = $("#resizable").width();
       d3.selectAll('svg')
           .attr('width', window.innerWidth-margin.right)
           .attr('height', window.innerHeight)

    })
}