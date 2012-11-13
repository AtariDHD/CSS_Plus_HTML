//defines a "CSS+HTML" sidebar pane and sets its height
chrome.devtools.panels.elements.createSidebarPane(
    "CSS+HTML",
    function(sidebar) {
        sidebar.setPage("sidebar.html");
        sidebar.setHeight("320px");
    }
);