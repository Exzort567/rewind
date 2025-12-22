import { motion, AnimatePresence } from 'framer-motion'

const FilterSection = ({ 
  dateFilter, 
  setDateFilter, 
  storiesCount, 
  totalCount 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="filter-section"
    >
      <div className="filter-header">
        <h2>Your Stories</h2>
        <div className="results-badge">
          {storiesCount} of {totalCount}
        </div>
      </div>

      
      <div className="date-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${dateFilter.type === 'all' ? 'active' : ''}`}
            onClick={() => setDateFilter({...dateFilter, type: 'all'})}
          >
            All
          </button>
          <button 
            className={`filter-tab ${dateFilter.type === 'specific' ? 'active' : ''}`}
            onClick={() => setDateFilter({...dateFilter, type: 'specific'})}
          >
            Specific Date
          </button>
          <button 
            className={`filter-tab ${dateFilter.type === 'range' ? 'active' : ''}`}
            onClick={() => setDateFilter({...dateFilter, type: 'range'})}
          >
            Date Range
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          {dateFilter.type === 'specific' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="date-inputs"
            >
              <input 
                type="date"
                value={dateFilter.specificDate}
                onChange={(e) => setDateFilter({...dateFilter, specificDate: e.target.value})}
                className="date-input"
              />
            </motion.div>
          )}
          
          {dateFilter.type === 'range' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="date-inputs"
            >
              <div className="date-range">
                <div className="date-field">
                  <label>From</label>
                  <input 
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                    className="date-input"
                  />
                </div>
                <div className="date-field">
                  <label>To</label>
                  <input 
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                    className="date-input"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default FilterSection
