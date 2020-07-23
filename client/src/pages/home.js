import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Scream from '../components/scream';
import Profile from '../components/profile';
import { connect } from 'react-redux';
import { getScreams } from '../redux/actions/dataActions';
import propTypes from 'prop-types';
import ScreamSkeleton from '../util/ScreamSkeleton';

class Home extends Component {
  componentDidMount() {
    this.props.getScreams();
  }

  render() {
    const { screams, loading } = this.props.data;
    let recentScreamsMarkup = !loading ? (
      //El método map() crea un nuevo array con los resultados
      //de la llamada a la función indicada aplicados a cada uno de sus elementos.
      screams.map(scream => <Scream key={scream.screamId} scream={scream} />)
    ) : (
      <ScreamSkeleton />
    );
    return (
      <Grid container spacing={5}>
        <Grid item sm={8} xx={12}>
          {recentScreamsMarkup}
        </Grid>
        <Grid item sm={4} xx={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

Home.propTypes = {
  getScreams: propTypes.func.isRequired,
  data: propTypes.object.isRequired
};

const mapStateToProps = state => ({
  data: state.data
});

export default connect(mapStateToProps, { getScreams })(Home);
