import React, { useState } from 'react'
import styled from 'styled-components'
import { useTable, usePagination } from 'react-table'
import api from '../api/Api';
import { Button, Dropdown } from 'react-bootstrap';
import UserRole from './UserRole';
import UserTableHeader from './UserTableHeader';

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
    state: { pageIndex, pageSize },
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
    usePagination
  )

  const [filterText, setFilterText] = useState('');

  // Listen for changes in pagination and use the state to fetch our new data
  React.useEffect(() => {
    fetchData({ pageIndex, pageSize, filterText })
  }, [fetchData, pageIndex, pageSize])


  // Render the UI for your table
  return (
    <div>
      <UserTableHeader initialFilterText="" onSearchFilter={(filterText: string) => {
        setFilterText(filterText);
        gotoPage(0);
        fetchData({ pageIndex, pageSize, filterText })
      }} />
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
        Header: 'User',
        columns: [
          {
            Header: 'Display Name',
            accessor: 'steamDisplayName'
          },
          {
            Header: 'Author Name',
            accessor: 'author.name'
          },
          {
            Header: 'SteamID64',
            accessor: 'username',
          },
          {
            Header: 'Role',
            accessor: 'role',
            Cell: props => {
              return (<UserRole initialRole={props.row.original.role} onRoleChanged={() => { }} username={props.row.original.username} />)
            }
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

  const fetchData = React.useCallback(async ({ pageSize, pageIndex, filterText }) => {
    // This will get called when the table needs new data
    // You could fetch your data from literally anywhere,
    // even a server. But for this example, we'll just fake it.

    // Give this fetch an ID
    const fetchId = ++fetchIdRef.current

    // Set the loading state
    setLoading(true);

    if (fetchId === fetchIdRef.current) {
      const users = await api.getUsers({ page: pageIndex + 1, limit: pageSize, sort: 'steamDisplayName', search: filterText?.length > 0 ? filterText : undefined });
      setPageCount(users.meta.totalPages);
      setData(users.data);
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