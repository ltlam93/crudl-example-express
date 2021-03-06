import { slugify } from '../utils'
import React from 'react'

//-------------------------------------------------------------------
var listView = {
    path: 'categories',
    title: 'Categories',
    actions: {
        /* counting the entries requires an additional API call per row. please note that the
        number of entries could be added at the database level, removing this additional call. */
        list: function (req) {
            return crudl.connectors.categories.read(req)
            .then(res => {
                let promises = res.data.map(item => crudl.connectors.entries.read(crudl.req().filter('category', item._id)))
                return Promise.all(promises)
                .then(item_entries => {
                    return res.set('data', res.data.map((item, index) => {
                        item.counterEntries = item_entries[index].data.length
                        return item
                    }))
                })
            })
		}
    }
}

listView.fields = [
    {
        name: '_id',
        label: 'ID',
    },
    {
        name: 'section',
        key: 'section.name',
        label: 'Section',
        sortable: true,
        sorted: 'ascending',
        sortpriority: '1',
    },
    {
        name: 'name',
        label: 'Name',
        main: true,
        sortable: true,
        sorted: 'ascending',
        sortpriority: '2',
        sortKey: 'slug',
    },
    {
        name: 'slug',
        label: 'Slug',
        sortable: true,
    },
    {
        name: 'counterEntries',
        label: 'No. Entries',
    },
]

listView.filters = {
    fields: [
        {
            name: 'name',
            label: 'Search',
            field: 'Search',
            props: {
                helpText: 'Name'
            }
        },
        {
            name: 'section',
            label: 'Section',
            field: 'Select',
            props: () => crudl.connectors.sections_options.read(crudl.req()).then(res => res.data),
            initialValue: '',
        },
    ]
}

//-------------------------------------------------------------------
var changeView = {
    path: 'categories/:_id',
    title: 'Category',
    actions: {
        get: function (req) { return crudl.connectors.category(crudl.path._id).read(req) },
        delete: function (req) { return crudl.connectors.category(crudl.path._id).delete(req) },
        save: function (req) { return crudl.connectors.category(crudl.path._id).update(req) },
    },
}

changeView.fields = [
    {
        name: 'section',
        key: 'section._id',
        label: 'Section',
        field: 'Select',
        required: true,
        props: () => crudl.connectors.sections_options.read(crudl.req()).then(res => res.data),
        add: {
            path: 'sections/new',
            returnValue: data => data._id,
        },
        edit: {
            path: () => `sections/${crudl.context('section')}`,
        },
    },
    {
        name: 'name',
        label: 'Name',
        field: 'String',
        required: true,
    },
    {
        name: 'slug',
        label: 'Slug',
        field: 'String',
        onChange: {
            in: 'name',
            setInitialValue: (name) => slugify(name.value),
        },
        props: {
            helpText: <span>If left blank, the slug will be automatically generated.
            More about slugs <a href="http://en.wikipedia.org/wiki/Slug" target="_blank">here</a>.</span>,
        }
    },
]

//-------------------------------------------------------------------
var addView = {
    path: 'categories/new',
    title: 'New Category',
    fields: changeView.fields,
    actions: {
        add: function (req) { return crudl.connectors.categories.create(req) },
    },
}


module.exports = {
    listView,
    changeView,
    addView,
}
