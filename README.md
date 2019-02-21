# polymer3-firebase
Basic implementation of using firebase/firestore in polymer3

# ATTENTION: This component still contains a lot of unneccessary content and is not properly tested. It should serve as start to find an alternative to use firebase and firestore with Polymer 3. 

# NOT TESTED - NO WARRANTIES OF ANY KIND :) Please do not use in production yet!

# Basic usage
    <!-- AUTHENTICATION (more settings to be done in data-auth.js, this is to be changed -->
    <data-auth id="auth" user="{{user}}" location="..." status-known="{{userStatusKnown}}"></data-auth>


    <!-- FIREBASE -->
    <data-firebase data="{{data}}" requested-location="users/xyz" live="true"></data-firebase>


    <!-- FIRESTORE -->
    <!-- bind to collection -->
    <data-firestore collection-path="public" collect="{{collection}}" query-filter-category="category" query-filter-value="[[categorySelected]]" live="true"></data-firestore>

    <!-- bind to data -->
    <data-firestore document-path="user/userxyz" data="{{data}}"></data-firestore>


    <!-- DATA UPLOAD -->
    possible, example TBD
