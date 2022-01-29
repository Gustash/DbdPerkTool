import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { useTable, usePagination, useRowSelect } from 'react-table'
import api from '../api/Api';
import { Button, Dropdown } from 'react-bootstrap';
import UserRole from './UserRole';
import UserContext from '../context/UserContext';
import log from 'electron-log';
import Api from '../api/Api';
import moment from 'moment';

const UserTableContainer = styled.div`
  height: 100%;
  width: 100%;
  display:flex;
  flex-direction: column;
`;

const UserTableFooter = styled.div`
  padding-top: 10px;
  display:flex;
  align-items: center;
  justify-content: center;
`

const Styles = styled.div`
  padding: 1rem;
  overflow-y: scroll;
  height: 100%;
  display: block;
  max-width: 100%;

  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid var(--main-color);
    background: rgba(0, 0, 0, .5);

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid var(--main-color);
      border-right: 1px solid var(--main-color);
    }
  }
`

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)

// Let's add a fetchData method to our Table component that will be used to fetch
// new data when pagination state changes
// We can also add a loading state to let our table know it's loading new data
function Table({
    columns,
    data,
    fetchData,
    loading,
    pageCount: controlledPageCount,
}) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        selectedFlatRows,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        // Get the state from the instance
        state: { pageIndex, pageSize, selectedRowIds },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0 }, // Pass our hoisted table state
            manualPagination: true, // Tell the usePagination
            // hook that we'll handle our own data fetching
            // This means we'll also have to provide our own
            // pageCount.
            pageCount: controlledPageCount,
        },
        usePagination,
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ])
        }
    )

    // Listen for changes in pagination and use the state to fetch our new data
    React.useEffect(() => {
        fetchData({ pageIndex, pageSize })
    }, [fetchData, pageIndex, pageSize])

    const userContext = useContext(UserContext);


    // Render the UI for your table
    return (
        <div>
            <div className="mb-2">
                {Object.keys(selectedRowIds).length > 0 && (
                    <Button variant="secondary" onClick={
                        async () => {
                            const deletePromises = selectedFlatRows.map(row => {
                                return userContext.user?.deleteNotification(row.original);
                            });
                            await Promise.all(deletePromises);
                            log.info('Deleted notifications');
                            fetchData({ pageIndex, pageSize });
                        }
                    }>Delete</Button>
                )}
                {Object.keys(selectedRowIds).length > 0 && (
                    <Button variant="secondary" className="ml-1" onClick={
                        async () => {
                            const markPromises = selectedFlatRows.filter(row => row.original.read === false).map(row => {
                                return userContext.user?.markNotification(row.original, true);
                            });
                            await Promise.all(markPromises);
                            fetchData({ pageIndex, pageSize });
                        }
                    }>Mark Read</Button>
                )}
            </div>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                    <tr>
                        {loading ? (
                            // Use our custom loading state to show a loading indicator
                            <td colSpan="10000">Loading...</td>
                        ) : (
                            <td colSpan="10000">
                                Showing {page.length} of ~{controlledPageCount * pageSize}{' '}
                                results
                            </td>
                        )}
                    </tr>
                </tbody>
            </table>
            {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
            <UserTableFooter>
                <Button className="btn-secondary mr-1" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </Button>{' '}
                <Button className="btn-secondary mr-1" onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </Button>{' '}
                <Button className="btn-secondary mr-1" onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </Button>{' '}
                <Button className="btn-secondary mr-1" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </Button>{' '}
                <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>
                <span>
                    | Go to page:{' '}
                    <input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            gotoPage(page)
                        }}
                        className="paginate-selector"
                    />
                </span>{' '}
                <select
                    className="paginate-selector"
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </UserTableFooter>
        </div>
    )
}

function App() {
    const columns = React.useMemo(
        () => [
            {
                Header: 'Notifications',
                columns: [
                    {
                        Header: '',
                        accessor: 'read',
                        style: {
                            textAlign: 'center'
                        },
                        // provide custom function to format props 
                        Cell: props => props.value ? <div><i className="fas fa-envelope-open-text"></i> </div> : <div><i className="fas fa-envelope"></i> </div>
                    },
                    {
                        Header: 'Title',
                        accessor: 'name'
                    },
                    {
                        Header: 'Text',
                        accessor: 'text'
                    },
                    {
                        Header: 'Age',
                        accessor: 'createdAt',
                        Cell: props => <div>{moment.duration(Date.now() - (new Date(props.value).getTime())).humanize()}</div>
                    },
                ],
            },
        ],
        []
    )

    // We'll start our table without any data
    const [data, setData] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [pageCount, setPageCount] = React.useState(0)
    const fetchIdRef = React.useRef(0)
    const userContext = useContext(UserContext);

    const fetchData = React.useCallback(async ({ pageSize, pageIndex }) => {
        // This will get called when the table needs new data
        // You could fetch your data from literally anywhere,
        // even a server. But for this example, we'll just fake it.

        // Give this fetch an ID
        const fetchId = ++fetchIdRef.current

        // Set the loading state
        setLoading(true);

        if (fetchId === fetchIdRef.current) {
            const notifications = await userContext.user.getNotifications({ page: pageIndex + 1, limit: pageSize });
            setPageCount(notifications.meta.totalPages);
            setData(notifications.data);
            await userContext.setUser(await Api.getUser());
            setLoading(false);
        }
    }, [])

    return (
        <UserTableContainer>
            <Styles>
                <Table
                    columns={columns}
                    data={data}
                    fetchData={fetchData}
                    loading={loading}
                    pageCount={pageCount}
                />
            </Styles>
        </UserTableContainer>
    )
}

export default App