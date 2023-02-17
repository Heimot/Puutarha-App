/**
 * This file is used for displaying the permissions.
 */

interface Role {
    name: string;
    permissions: Permissions[];
}

interface Permissions {
    path: string;
    label: string;
    disabled?: boolean;
    defaultChecked?: boolean;
}

const Roles: Role[] = [
    {
        name: 'Käyttäjä oikeudet',
        permissions: [
            { path: '/auth/get_all_users', label: 'Voi nähdä kaikki käyttäjät' },
            { path: '/auth/sign_up', label: 'Voi luoda käyttäjiä' },
            { path: '/auth/add_role', label: 'Voi lisätä rooleja käyttäjille' },
            { path: '/auth/delete_user', label: 'Voi poistaa käyttäjiä' },
            { path: '/auth/get_my_user_data', label: 'Voi hakea omat käyttäjätiedot (PAKOLLINEN)', disabled: true, defaultChecked: true },
        ]
    },
    {
        name: 'Tilaus oikeudet',
        permissions: [
            { path: '/orders/get_orders_with_date', label: 'Voi hakea tilaukset päivämäärällä' },
            { path: '/orders/get_order_with_id', label: 'Voi hakea tilauksen id:llä' },
            { path: '/orders/create_order_with_products', label: 'Voi luoda tilauksen tuotteiden kanssa' },
            { path: '/orders/edit_order', label: 'Voi muokata tilausta' },
            { path: '/orders/delete_order', label: 'Voi poistaa tilauksen' },
            { path: '/orders/get_calendar_picking', label: 'Voi hakea keräys kalenterin' },
            { path: '/orders/get_calendar_delivery', label: 'Voi hakea toimitus kalenterin' }
        ]
    },
    {
        name: 'Tuote oikeudet',
        permissions: [
            { path: '/products/change_products_state', label: 'Voi vaihtaa tuotteen keräystilaa' },
            { path: '/products/change_products_status', label: 'Voi vaihtaa tuotteen tarkastustilaa' },
            { path: '/products/delete_product', label: 'Voi poistaa tuotteita' }
        ],
    },
    {
        name: 'Asetus oikeudet',
        permissions: [
            { path: '/settings/get_settings', label: 'Voi hakea asetukset' },
            { path: '/settings/get_personal_settings', label: 'Voi hakea omat asetukset' },
            { path: '/settings/edit_personal_settings', label: 'Voi muokata omia asetuksia' }
        ],
    },
    {
        name: 'Kuva oikeudet',
        permissions: [
            { path: '/files/upload', label: 'Voi lataa kuvia' },
            { path: '/files/get_files', label: 'Voi hakea kaikki kuvat' },
            { path: '/files/get_image_by_id', label: 'Voi hakea kuvan id:llä' },
            { path: '/files/delete_image', label: 'Voi poistaa kuvia' }

        ],
    },
    {
        name: 'Tilauksen keräystilanne',
        permissions: [
            { path: '/statuslocation/get_status_location', label: 'Voi hakea kaikki eri tilanteet' },
            { path: '/statuslocation/create_status_location', label: 'Voi luoda uusia tilanteita' },
            { path: '/statuslocation/edit_status_location', label: 'Voi muokata tilanteita' },
            { path: '/statuslocation/delete_status_location', label: 'Voi poistaa tilanteita' }
        ]
    },
    {
        name: 'Rekkojen luonti',
        permissions: [
            { path: '/trucks/get_trucks', label: 'Voi hakea kaikki rekat' },
            { path: '/trucks/create_truck', label: 'Voi luoda rekkoja' },
            { path: '/trucks/edit_truck', label: 'Voi muokata rekkoja' },
            { path: '/trucks/delete_truck', label: 'Voi poistaa rekkoja' }
        ]
    },
    {
        name: 'Kalenterin lisätietojen oikeudet',
        permissions: [
            { path: '/calendar/get_calendar_info', label: 'Voi hakea kalenterista lisätietoja' },
            { path: '/calendar/create_calendar', label: 'Voi luoda kalenterissa olevia rekkoja' },
            { path: '/calendar/edit_calendar', label: 'Voi muokata kalenterissa olevia rekkoja' },
            { path: '/calendar/delete_calendar', label: 'Voi poistaa kalenterissa olevia rekkoja' }
        ]
    },
    {
        name: 'Roolien luonti',
        permissions: [
            { path: '/roles/get_roles', label: 'Voi hakea kaikki roolit' },
            { path: '/roles/create_role', label: 'Voi luoda rooleja' },
            { path: '/roles/delete_role', label: 'Voi poistaa rooleja' },
            { path: '/roles/change_permissions', label: 'Voi muokata roolejen oikeuksia' },
            { path: '/roles/edit_role', label: 'Voi muokata roolin muita asetuksia' }
        ]
    },
    {
        name: 'Keräyspiste oikeudet',
        permissions: [
            { path: '/location/get_locations', label: 'Voi hakea kaikki keräyspisteet' },
            { path: '/location/create_location', label: 'Voi luoda keräyspisteitä' },
            { path: '/location/edit_location', label: 'Voi muokata keräyspisteitä' },
            { path: '/location/delete_location', label: 'Voi poistaa keräyspisteitä' }
        ]
    },
    {
        name: 'Kukkien ja kauppojen oikeudet',
        permissions: [
            { path: '/names/get_names', label: 'Voi hakea kaikki kaupat ja kukat' },
            { path: '/names/get_names_with_group', label: 'Voi hakea joko kaupat tai kukat' },
            { path: '/names/create_name', label: 'Voi luoda uusia kukkia tai kauppoja' },
            { path: '/names/edit_name', label: 'Voi muokata kukkia tai kauppoja' },
            { path: '/names/delete_name', label: 'Voi poistaa kukkia tai kauppoja' }
        ]
    },
    {
        name: 'Tuotteiden tilanne oikeudet',
        permissions: [
            { path: '/state/get_states', label: 'Voi hakea tuotteiden tilanteet' },
            { path: '/state/create_state', label: 'Voi luoda tuotteiden tilanteita' },
            { path: '/state/edit_state', label: 'Voi muokata tuotteiden tilanteita' },
            { path: '/state/delete_state', label: 'Voi poistaa tuotteiden tilanteita' }
        ]
    },
    {
        name: 'Tilausten tilanne oikeudet',
        permissions: [
            { path: '/status/get_status', label: 'Voi hakea tilausten tilanteet' },
            { path: '/status/create_status', label: 'Voi luoda tilauksien tilanteita' },
            { path: '/status/edit_status', label: 'Voi muokata tilausten tilanteita' },
            { path: '/status/delete_status', label: 'Voi poistaa tilausten tilanteita' }
        ]
    },
    {
        name: 'Rullakoiden oikeudet',
        permissions: [
            { path: '/rollers/get_rollers', label: 'Voi hakea rullakot' },
            { path: '/rollers/create_roller', label: 'Voi luoda rullakoita' },
            { path: '/rollers/edit_roller', label: 'Voi muokata rullakoita' },
            { path: '/rollers/delete_roller', label: 'Voi poistaa rullakoita' }
        ]
    },
    {
        name: 'PDF tiedosto oikeudet',
        permissions: [
            { path: '/pdf/get_pdfs', label: 'Voi hakea pdf tiedostot' },
            { path: '/pdf/get_pdf_names', label: 'Voi hakea pdf tiedoston nimet' },
            { path: '/pdf/get_pdf_by_id', label: 'Voi hakea pdf tiedoston id:llä' },
            { path: '/pdf/create_pdf', label: 'Voi luoda pdf tiedostoja' },
            { path: '/pdf/delete_pdf', label: 'Voi poistaa pdf tiedostoja' },
            { path: '/pdf/edit_pdf', label: 'Voi muokata pdf tiedostoja' },
            { path: '/pdfimage/get_pdf_image', label: 'Voi hakea pdf tiedostojen kuvat' },
            { path: '/pdfimage/add_pdf_image', label: 'Voi lisätä kuvia pdf tiedostoihin' },
            { path: '/pdfimage/delete_pdf_image', label: 'Voi poistaa kuvia pdf tiedostoista' },
            { path: '/pdftext/get_pdf_text', label: 'Voi hakea pdf tiedostojen tekstit' },
            { path: '/pdftext/add_pdf_text', label: 'Voi lisätä pdf tiedostoihin tekstiä' },
            { path: '/pdftext/delete_pdf_text', label: 'Voi poistaa pdf tiedostojen tekstiä' }
        ]
    },
    {
        name: 'Tilausten keräyslogit',
        permissions: [
            { path: '/editlog/get_logs', label: 'Voi hakea kaikkien keräyslogit' },
            { path: '/editlog/get_logs_for_product', label: 'Voi hakea yhden tuotteen keräyslogit' },
        ]
    },
    {
        name: 'RFID kortti oikeudet',
        permissions: [
            { path: '/card/get_cards', label: 'Voi hakea RFID kortit' },
            { path: '/card/add_card', label: 'Voi luoda RFID kortin' },
            { path: '/card/delete_card', label: 'Voi poistaa RFID kortin' },
            { path: '/card/update_card', label: 'Voi päivittää RFID korttia' }
        ]
    },
    {
        name: 'Muutos logi oikeudet',
        permissions: [
            { path: '/log/get_logs', label: 'Voi hakea muutos logit' },
            { path: '/logger/get_loggers', label: 'Voi hakea tilauksien muutos logit' }
        ]
    }
]

export default Roles;