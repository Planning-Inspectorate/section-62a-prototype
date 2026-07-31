import govukPrototypeKit from 'govuk-prototype-kit';
const addFilter = govukPrototypeKit.views.addFilter;

// lpa addresses mapped to lpa name
const lpaAddressLookup = {
  "Bristol City Council": {
    addressLine1: "City Hall",
    addressLine2: "College Green",
    townCity: "Bristol",
    postcode: "BS1 5TR"
  },
  "Camden London Borough Council": {
    addressLine1: "5 Pancras Square",
    addressLine2: "c/o Town Hall, Judd Street",
    townCity: "London",
    postcode: "WC1H 9JE"
  },
  "Cornwall Council": {
    addressLine1: "County Hall",
    addressLine2: "Treyew Road",
    townCity: "Truro",
    postcode: "TR1 3AY"
  },
  "Manchester City Council": {
    addressLine1: "Town Hall",
    addressLine2: "Albert Square",
    townCity: "Manchester",
    postcode: "M60 2LA"
  },
  "Nottingham City Council": {
    addressLine1: "Loxley House",
    addressLine2: "Station Street",
    townCity: "Nottingham",
    postcode: "NG2 3NG"
  },
  "Sheffield City Council": {
    addressLine1: "Town Hall",
    addressLine2: "Pinstone Street",
    townCity: "Sheffield",
    postcode: "S1 2HH"
  },
  "Southwark Council": {
    addressLine1: "160 Tooley Street",
    addressLine2: "",
    townCity: "London",
    postcode: "SE1 2QH"
  },
  "Wandsworth Borough Council": {
    addressLine1: "The Town Hall",
    addressLine2: "Wandsworth High Street",
    townCity: "London",
    postcode: "SW18 2PU"
  },
  "Westminster City Council": {
    addressLine1: "64 Victoria Street",
    addressLine2: "",
    townCity: "London",
    postcode: "SW1E 6QP"
  },
  "York City Council": {
    addressLine1: "West Offices",
    addressLine2: "Station Rise",
    townCity: "York",
    postcode: "YO1 6GA"
  }
};

// 2. Register the filter
addFilter('getLpaAddress', function(lpaName) {
  if (!lpaName || !lpaAddressLookup[lpaName]) {
    return null;
  }
  return lpaAddressLookup[lpaName];
});


// convert ISO date to GDS format
addFilter('toGovukDate', function(dateString) {
  if (!dateString) return null;
  
  // Convert the ISO string back into a real JavaScript Date object
  const date = new Date(dateString);
  
  // Use the built-in Internationalization API to format it perfectly for the UK
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
});