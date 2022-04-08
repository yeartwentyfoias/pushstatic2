window.konfirmi_Config = {
    messages: {
        pleaseVerify: "Please verify!",
        wasVerified: "You were verified!",
        serverError: "There was an error 400",
        smthWentWrong: "Something else other than 200 was returned",
        containerAttached: "Container has been successfully attached to the form"
    },
    notificationId: 'verify_error',
    konfirmiContainerSelector: '.konfirmi-container[id^="konfirmi-container-"]',
    konfirmiIframeSelector: 'a',
    konfirmiClasses: {
        'konfirmi-first-name' : 'first_name',
        'konfirmi-last-name' : 'last_name',
        'konfirmi-email' : 'email',
        'konfirmi-phone' : 'phone',
        'konfirmi-country': 'country',
        'konfirmi-city' : 'city',
        'konfirmi-state' : 'state',
        'konfirmi-street' : 'street',
        'konfirmi-zipcode' : 'zipcode'
    },
    agileInputSelectors: {
        'address': 'street',
        'first_name': 'first_name',
        'last_name': 'last_name',
        'email': 'email',
        'phone': 'phone',
        'country': 'country',
        'city': 'city',
        'state': 'state',
        'zip': 'zipcode'
    }
}
